"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Car, Users, XCircle, CreditCard, CheckCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { getSocket } from '@/lib/socket'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Utility to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Dynamically import MapTracking to avoid SSR issues
const MapTracking = dynamic(() => import('./MapTracking'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-500">Loading Map...</div> })

interface TrackingDashboardProps {
  booking: {
    id: string
    status: string
    pickup: string
    drop: string
    vehicleType: string
    fare?: number
    distance?: string
    pickupLat?: number
    pickupLng?: number
    dropLat?: number
    dropLng?: number
    startOtp?: string
  }
}

const TrackingDashboard = ({ booking }: TrackingDashboardProps) => {
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState(booking.status)
  const [driverInfo, setDriverInfo] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [notifiedCount, setNotifiedCount] = useState<number | string>('Scanning...')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Socket.IO Push Architecture Integration
    if (session?.user?.id) {
      const socket = getSocket()
      
      const registerAndJoin = () => {
        // Register this customer with the socket server
        socket.emit('register_user', {
          userId: session.user.id,
          role: 'customer'
        })

        // If already accepted, join the tracking room immediately
        if (booking.status === 'accepted' || currentStatus === 'accepted') {
          socket.emit('join_ride', { rideId: booking.id })
        }
      }

      // Initial run
      registerAndJoin()

      // Handle network reconnects (e.g., app backgrounded and restored)
      socket.on('connect', registerAndJoin)

      // Listen for when a driver accepts the ride
      const handleRideAccepted = (data: any) => {
        if (data.rideId === booking.id) {
          toast.success(`Driver ${data.driverName || ''} has accepted your ride!`)
          setCurrentStatus('accepted')
          setDriverInfo({
            name: data.driverName,
            vehicleDetails: data.vehicleDetails
          })
          // Instantly join the live tracking room
          socket.emit('join_ride', { rideId: booking.id })
        }
      }

      // Listen for live GPS updates from the driver
      const handleLocationUpdate = (data: any) => {
        setDriverLocation({
          lat: data.latitude,
          lng: data.longitude
        })
      }

      // Listen for if the driver cancels the ride
      const handleRideCancelled = (data: any) => {
        if (data.rideId === booking.id) {
          toast.error("The driver has cancelled this ride.")
          router.push('/') // Send back to home
        }
      }

      // Handle no drivers found in 5km radius
      const handleNoDriversFound = async (data: any) => {
        if (data.rideId === booking.id) {
          toast.error("No vehicles found nearby. Please try again later.")
          setNotifiedCount(0)
          
          // Auto-cancel the ride in the database so it doesn't stay 'searching'
          try {
            await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' })
            router.push('/')
          } catch (e) {
            console.error(e)
            router.push('/')
          }
        }
      }

      // Handle exact number of drivers notified by the Uber Algorithm
      const handleDriversNotified = (data: any) => {
        setNotifiedCount(data.count)
      }

      // Handle generic status updates (arriving, started, completed)
      const handleRideStatusUpdated = (data: any) => {
        if (data.rideId === booking.id) {
          setCurrentStatus(data.status)
          if (data.status === 'arriving') {
            toast.success("Driver has arrived at the pickup location!")
          } else if (data.status === 'started') {
            toast.success("Journey started! Have a safe ride.")
          } else if (data.status === 'completed') {
            toast.success("Trip completed! Please complete your payment.")
            // Do NOT redirect here, show the payment UI instead.
          }
        }
      }

      socket.on('ride_accepted', handleRideAccepted)
      socket.on('driver_location_updated', handleLocationUpdate)
      socket.on('ride_cancelled', handleRideCancelled)
      socket.on('no_drivers_found', handleNoDriversFound)
      socket.on('drivers_notified', handleDriversNotified)
      socket.on('ride_status_updated', handleRideStatusUpdated)

      return () => {
        socket.off('connect', registerAndJoin)
        socket.off('ride_accepted', handleRideAccepted)
        socket.off('driver_location_updated', handleLocationUpdate)
        socket.off('ride_cancelled', handleRideCancelled)
        socket.off('no_drivers_found', handleNoDriversFound)
        socket.off('drivers_notified', handleDriversNotified)
        socket.off('ride_status_updated', handleRideStatusUpdated)
      }
    }
  }, [session, booking.id, booking.status, currentStatus, router])

  const handleCancelRide = async () => {
    if (confirm("Are you sure you want to cancel this ride request?")) {
      setIsCancelling(true)
      try {
        const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' })
        const data = await res.json()
        
        if (res.ok) {
          toast.success("Ride cancelled successfully.")
          const socket = getSocket()
          socket.emit('cancel_ride', { rideId: booking.id, customerId: session?.user?.id })
          router.push('/')
        } else {
          toast.error(data.error || "Failed to cancel ride.")
          setIsCancelling(false)
        }
      } catch (error) {
        toast.error("Network error.")
        setIsCancelling(false)
      }
    }
  }

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Failed to load Razorpay SDK. Check your connection.");
        setIsPaying(false);
        return;
      }

      // Create Order on Backend
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || "Failed to create payment order");
        setIsPaying(false);
        return;
      }

      // Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RideFlow",
        description: `Payment for Ride #${booking.id.slice(-6).toUpperCase()}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id
              }),
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment Successful! Thank you.");
              // Notify driver via socket
              const socket = getSocket();
              socket.emit("payment_successful", { rideId: booking.id });
              // Redirect home
              setTimeout(() => router.push("/"), 2000);
            } else {
              toast.error(verifyData.error || "Payment verification failed");
              setIsPaying(false);
            }
          } catch (e) {
            toast.error("Network error during verification");
            setIsPaying(false);
          }
        },
        prefill: {
          name: session?.user?.name || "Customer",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#10b981", // Emerald 500
        },
        modal: {
          ondismiss: function() {
            setIsPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error(response.error.description || "Payment failed");
        setIsPaying(false);
      });
      rzp.open();
    } catch (error) {
      toast.error("Payment initialization failed");
      setIsPaying(false);
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] pt-[72px] flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Map */}
      <div className="w-full md:w-1/2 lg:w-[55%] relative h-[50vh] md:h-full z-0 bg-[#121212] border-r border-white/10">
        <MapTracking 
          pickupAddress={booking.pickup} 
          dropAddress={booking.drop} 
          driverLocation={driverLocation}
          exactPickup={booking.pickupLat && booking.pickupLng ? { lat: booking.pickupLat, lng: booking.pickupLng } : undefined}
          exactDrop={booking.dropLat && booking.dropLng ? { lat: booking.dropLat, lng: booking.dropLng } : undefined}
          onRouteCalculated={(dist, dur) => {
            setDistance(dist)
            setDuration(dur)
          }} 
        />
      </div>

      {/* Right Panel: Details & Status */}
      <div className="w-full md:flex-1 p-6 overflow-y-auto bg-[#0a0a0a] flex flex-col gap-6 relative z-10 custom-scrollbar">
        
        {/* Header */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Ride Status</h1>
            <p className="text-gray-400 text-xs">
              ID: <span className="font-mono text-gray-300">{booking.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div>
            {currentStatus === 'searching' ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">Finding Driver</span>
              </div>
            ) : (
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide uppercase border border-emerald-500/20">
                {currentStatus}
              </span>
            )}
          </div>
        </div>

        {/* Conditional Rendering based on Trip Completion */}
        {currentStatus === 'completed' ? (
          <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/20 rounded-3xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Trip Completed!</h2>
            <p className="text-gray-400 text-center mb-8">You have arrived at your destination. Please complete your payment to finish the ride.</p>
            
            <div className="w-full bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-gray-400 text-sm">Total Fare</span>
                <span className="text-3xl font-extrabold text-white">₹{booking.fare}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Distance Traveled</span>
                <span className="text-gray-300 font-medium">{distance || booking.distance}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isPaying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₹{booking.fare} Securely
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Estimation & Available Drivers (Mock Data) */}
            <div className={`grid ${currentStatus !== 'searching' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Trip Estimate</p>
                  <Navigation size={14} className="text-blue-400" />
                </div>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-2xl font-extrabold">{booking.fare ? `₹${booking.fare}` : duration || '--'}</span>
                </div>
                <span className="text-gray-400 text-xs font-medium">{booking.distance ? `${booking.distance}` : distance || 'Calculating...'}</span>
              </div>

              {currentStatus !== 'searching' && (
                <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border border-emerald-500/20 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </p>
                    <Users size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="font-extrabold text-xl capitalize">
                      {currentStatus}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">
                    {currentStatus === 'accepted' && "Driver is on the way"}
                    {currentStatus === 'arriving' && "Driver is outside"}
                    {currentStatus === 'started' && "Heading to destination"}
                  </span>
                </div>
              )}
            </div>

            {/* OTP Card */}
            {booking.startOtp && (currentStatus === 'accepted' || currentStatus === 'arriving') && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider mb-1">Ride PIN</p>
                  <p className="text-sm text-gray-300">Give this PIN to your driver</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 px-6 py-2 rounded-xl">
                  <span className="text-2xl font-extrabold text-yellow-400 tracking-widest">{booking.startOtp}</span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 mb-8">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ride Details</h2>
              
              <div className="flex flex-col gap-4 relative">
                {/* Connecting line */}
                <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-white/10 z-0"></div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-1.5 bg-[#0a0a0a] border border-blue-500/50 text-blue-500 rounded-full mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pickup</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{booking.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-1.5 bg-[#0a0a0a] border border-red-500/50 text-red-500 rounded-full mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Drop</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{booking.drop}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10 pl-2">
                  <div className="text-purple-500">
                    <Car size={18} />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <p className="text-sm text-gray-400">Requested Vehicle</p>
                    <p className="text-sm text-white font-bold">{booking.vehicleType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelRide}
              disabled={isCancelling}
              className="w-full py-4 mt-auto bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCancelling ? (
                <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle size={18} />
                  Cancel Ride
                </>
              )}
            </button>
          </>
        )}
      </div>

    </div>
  )
}

export default TrackingDashboard
