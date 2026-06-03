"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Compass, CheckCircle, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { getSocket } from '@/lib/socket'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Dynamically import MapTracking to avoid SSR issues
const MapTracking = dynamic(() => import('./MapTracking'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-500">Loading Map...</div> })

interface DriverActiveTripProps {
  booking: {
    id: string
    status: string
    pickup: string
    drop: string
    vehicleType: string
    pickupLat?: number
    pickupLng?: number
    dropLat?: number
    dropLng?: number
  }
}

export default function DriverActiveTrip({ booking }: DriverActiveTripProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket()
    
    // Register this driver with the socket server
    socket.emit('register_user', {
      userId: session.user.id,
      role: 'partner'
    })

    // Start watching GPS location
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading: posHeading } = position.coords;
          
          setCurrentLocation({ lat: latitude, lng: longitude });
          setHeading(posHeading);

          // Broadcast location to the socket server
          socket.emit('update_location', {
            rideId: booking.id,
            latitude,
            longitude,
            heading: posHeading
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          toast.error("Unable to access GPS location for tracking.");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );

      // Listen for if the customer cancels the ride
      const handleRideCancelled = (data: any) => {
        if (data.rideId === booking.id) {
          toast.error("The customer has cancelled this ride.")
          router.push('/partner/dashboard') 
        }
      }

      socket.on('ride_cancelled', handleRideCancelled)

      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.off('ride_cancelled', handleRideCancelled)
      };
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  }, [session, booking.id, router])

  const handleCompleteTrip = async () => {
    setIsCompleting(true)
    try {
      // In a real app, this would be a PUT request to /api/bookings/[id]/complete
      toast.success("Trip Completed Successfully!")
      setTimeout(() => {
        router.push('/partner/dashboard')
      }, 1500)
    } catch (error) {
      toast.error("Failed to complete trip")
      setIsCompleting(false)
    }
  }

  const handleCancelTrip = async () => {
    if (confirm("Are you sure you want to cancel this trip?")) {
      setIsCancelling(true)
      try {
        const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' })
        const data = await res.json()
        
        if (res.ok) {
          toast.success("Trip cancelled successfully.")
          const socket = getSocket()
          socket.emit('cancel_ride', { rideId: booking.id })
          router.push('/partner/dashboard')
        } else {
          toast.error(data.error || "Failed to cancel trip.")
          setIsCancelling(false)
        }
      } catch (error) {
        toast.error("Network error.")
        setIsCancelling(false)
      }
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] pt-[72px] flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Map */}
      <div className="w-full md:w-1/2 lg:w-[60%] relative h-[50vh] md:h-full z-0 bg-[#121212] border-r border-white/10">
        <MapTracking 
          pickupAddress={booking.pickup} 
          dropAddress={booking.drop} 
          driverLocation={currentLocation}
          exactPickup={booking.pickupLat && booking.pickupLng ? { lat: booking.pickupLat, lng: booking.pickupLng } : undefined}
          exactDrop={booking.dropLat && booking.dropLng ? { lat: booking.dropLat, lng: booking.dropLng } : undefined}
          onRouteCalculated={(dist, dur) => {
            setDistance(dist)
            setDuration(dur)
          }} 
        />
      </div>

      {/* Right Panel: Trip Details & Controls */}
      <div className="w-full md:flex-1 p-6 overflow-y-auto bg-[#0a0a0a] flex flex-col gap-6 relative z-10 custom-scrollbar">
        
        {/* Header */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Active Trip</h1>
            <p className="text-gray-400 text-xs">
              ID: <span className="font-mono text-gray-300">{booking.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div>
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide uppercase border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Tracking
            </span>
          </div>
        </div>

        {/* GPS Status */}
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/20 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${currentLocation ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400 animate-pulse'}`}>
              <Compass size={20} />
            </div>
            <div>
              <p className="text-white text-sm font-bold">GPS Signal</p>
              <p className="text-xs text-gray-400">
                {currentLocation ? `Broadcasting: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Acquiring satellites...'}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Navigation Details</h2>
          
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-white/10 z-0"></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="p-1.5 bg-[#0a0a0a] border border-blue-500/50 text-blue-500 rounded-full mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 pb-4 border-b border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pickup Customer</p>
                <p className="text-sm text-gray-200 line-clamp-2">{booking.pickup}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="p-1.5 bg-[#0a0a0a] border border-red-500/50 text-red-500 rounded-full mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 pb-4 border-b border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Dropoff Location</p>
                <p className="text-sm text-gray-200 line-clamp-2">{booking.drop}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleCompleteTrip}
            disabled={isCompleting || isCancelling}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isCompleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={20} />
                Complete Trip & Collect Payment
              </>
            )}
          </button>

          <button
            onClick={handleCancelTrip}
            disabled={isCompleting || isCancelling}
            className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isCancelling ? (
              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <>
                <XCircle size={18} />
                Cancel Trip
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
