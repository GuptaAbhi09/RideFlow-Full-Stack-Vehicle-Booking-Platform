"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Car, Users, XCircle, CreditCard, CheckCircle, Star, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { getSocket } from '@/lib/socket'
import RideChat from './RideChat'
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
    trackingToken?: string
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
  const [isRatingMode, setIsRatingMode] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
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

  const handleShareTracking = async () => {
    if (!booking.trackingToken) {
      toast.error("Tracking link not available yet.");
      return;
    }
    const url = `${window.location.origin}/track/${booking.trackingToken}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track my RideFlow trip live!',
          text: `I'm on a ride! Watch my live location here:`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied to clipboard!");
    }
  };

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

  const submitRating = async () => {
    setIsSubmittingRating(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });
      if (res.ok) {
        toast.success("Thank you for your feedback!");
        setTimeout(() => router.push("/"), 1500);
      } else {
        toast.error("Failed to submit rating.");
        setIsSubmittingRating(false);
      }
    } catch (e) {
      toast.error("Network error");
      setIsSubmittingRating(false);
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
              toast.success("Payment Successful! Please rate your driver.");
              // Notify driver via socket
              const socket = getSocket();
              socket.emit("payment_successful", { rideId: booking.id });
              
              // Enter Rating Mode
              setIsRatingMode(true);
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
    <div className="h-screen bg-[#0f0f0f] pt-[72px] flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Map */}
      <div className="w-full md:w-1/2 lg:w-[55%] relative h-[40vh] md:h-full z-0 bg-[#0f0f0f] border-r border-[#2a2a2a]">
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
      <div className="w-full md:flex-1 p-4 md:p-6 overflow-y-auto bg-[#0f0f0f] flex flex-col gap-6 relative z-10 custom-scrollbar">
        
        {/* Header */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 sm:p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#f5f5f5] mb-1">Ride Status</h1>
            <p className="text-[#9ca3af] text-xs">
              ID: <span className="font-mono text-gray-300">{booking.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div>
            {currentStatus === 'searching' ? (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[#f5f5f5] text-xs font-medium">Finding Driver</span>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-[#f5f5f5] text-xs font-medium capitalize">
                  {currentStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Share Live Tracking */}
        {booking.trackingToken && (currentStatus === 'accepted' || currentStatus === 'arriving' || currentStatus === 'started') && (
          <button 
            onClick={handleShareTracking}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a] text-[#f5f5f5] rounded-xl p-4 flex items-center justify-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Share2 size={18} className="text-blue-500" />
            Share Live Tracking Link
          </button>
        )}

        {/* Conditional Rendering based on Trip Completion / Rating */}
        {isRatingMode ? (
          <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <div className="mb-6">
              <Star size={40} className="text-[#9ca3af]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-2">Rate Your Driver</h2>
            <p className="text-[#9ca3af] text-center mb-8">How was your trip with {driverInfo?.name || "your driver"}?</p>
            
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    size={48} 
                    className={`${star <= rating ? 'text-[#facc15] fill-[#facc15]' : 'text-[#374151]'} transition-colors`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 text-[#f5f5f5] placeholder:text-[#9ca3af] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-8 resize-none h-32 text-sm"
            />

            <button
              onClick={submitRating}
              disabled={isSubmittingRating}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmittingRating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Submit Rating"
              )}
            </button>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 text-[#9ca3af] text-sm hover:text-[#f5f5f5] transition-colors"
            >
              Skip
            </button>
          </div>
        ) : currentStatus === 'completed' ? (
          <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <div className="mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-2">Trip Completed!</h2>
            <p className="text-[#9ca3af] text-center mb-8">You have arrived at your destination. Please complete your payment to finish the ride.</p>
            
            <div className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2a2a2a]">
                <span className="text-[#9ca3af] text-sm">Total Fare</span>
                <span className="text-2xl font-semibold text-[#f5f5f5]">₹{booking.fare}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-[#9ca3af]">
                <span>Distance Traveled</span>
                <span className="text-[#f5f5f5] font-medium">{distance || booking.distance}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
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
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[#9ca3af] text-xs font-medium">Trip Estimate</p>
                  <Navigation size={14} className="text-[#9ca3af]" />
                </div>
                <div className="flex items-baseline gap-1 text-[#f5f5f5]">
                  <span className="text-xl font-semibold">{booking.fare ? `₹${booking.fare}` : duration || '--'}</span>
                </div>
                <span className="text-[#9ca3af] text-xs">{booking.distance ? `${booking.distance}` : distance || 'Calculating...'}</span>
              </div>

              {currentStatus !== 'searching' && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[#9ca3af] text-xs font-medium">Status</p>
                    <Users size={14} className="text-[#9ca3af]" />
                  </div>
                  <div className="flex items-baseline gap-1 text-[#f5f5f5]">
                    <span className="font-semibold text-lg capitalize">
                      {currentStatus}
                    </span>
                  </div>
                  <span className="text-[#9ca3af] text-xs">
                    {currentStatus === 'accepted' && "Driver is on the way"}
                    {currentStatus === 'arriving' && "Driver is outside"}
                    {currentStatus === 'started' && "Heading to destination"}
                  </span>
                </div>
              )}
            </div>

            {/* OTP Card */}
            {booking.startOtp && (currentStatus === 'accepted' || currentStatus === 'arriving') && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[#9ca3af] text-xs font-medium mb-1">Ride PIN</p>
                  <p className="text-sm text-[#f5f5f5]">Give this PIN to your driver</p>
                </div>
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] px-4 py-2 rounded-lg">
                  <span className="text-lg font-mono text-[#f5f5f5] tracking-widest">{booking.startOtp}</span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4 mb-8">
              <h2 className="text-sm font-medium text-[#f5f5f5]">Ride Details</h2>
              
              <div className="flex flex-col gap-4 relative">
                {/* Connecting line */}
                <div className="absolute left-4 top-6 bottom-6 w-[1px] bg-[#2a2a2a] z-0"></div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-full mt-1">
                    <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-[#2a2a2a]">
                    <p className="text-xs text-[#9ca3af] mb-1">Pickup</p>
                    <p className="text-sm text-[#f5f5f5] line-clamp-2">{booking.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-full mt-1">
                    <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-[#2a2a2a]">
                    <p className="text-xs text-[#9ca3af] mb-1">Drop</p>
                    <p className="text-sm text-[#f5f5f5] line-clamp-2">{booking.drop}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10 pl-2">
                  <div className="text-[#9ca3af]">
                    <Car size={18} />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <p className="text-sm text-[#9ca3af]">Requested Vehicle</p>
                    <p className="text-sm text-[#f5f5f5] font-medium">{booking.vehicleType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelRide}
              disabled={isCancelling}
              className="w-full mt-auto text-red-500 font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 py-2.5"
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

      {/* Ride Chat Component */}
      {(currentStatus === 'accepted' || currentStatus === 'arriving' || currentStatus === 'started') && (
        <RideChat bookingId={booking.id} role="customer" />
      )}
    </div>
  )
}

export default TrackingDashboard
