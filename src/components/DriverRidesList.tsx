"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, Car, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import { useSession } from 'next-auth/react'

export default function DriverRidesList() {
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const fetchRides = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      const res = await fetch('/api/driver/available-rides')
      const data = await res.json()
      
      if (res.ok) {
        setRides(data.rides)
      } else {
        toast.error(data.error || "Failed to load rides")
      }
    } catch (error) {
      toast.error("Network error while fetching rides")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchRides()
    
    // Socket.IO Push Architecture Integration
    if (session?.user?.id) {
      const socket = getSocket()
      
      // Register this driver with the socket server
      socket.emit('register_user', {
        userId: session.user.id,
        role: 'partner'
      })

      // Listen for instant ride requests from customers
      const handleNewRide = (data: any) => {
        toast.success("New Ride Request!")
        
        // Map the socket data to our local state shape
        const newRide = {
          _id: data.rideId,
          pickup: data.pickup,
          drop: data.drop,
          vehicleType: "Any", // We'll assume the REST call would have this, but for real-time demo we can mock or wait for full fetch
          createdAt: new Date().toISOString()
        }
        
        // Prepend to list
        setRides(prev => [newRide, ...prev])
      }

      socket.on('new_ride_request', handleNewRide)

      return () => {
        socket.off('new_ride_request', handleNewRide)
      }
    }
  }, [fetchRides, session])

  const handleAcceptRide = async (rideId: string) => {
    try {
      setAcceptingId(rideId)
      const res = await fetch(`/api/bookings/${rideId}/accept`, {
        method: 'POST'
      })
      const data = await res.json()

      if (res.ok) {
        toast.success("Ride Accepted Successfully!")
        // Remove from the local list since it's no longer 'searching'
        setRides(prev => prev.filter(r => r._id !== rideId))
        
        // Notify the customer instantly via Socket.IO
        if (session?.user) {
          const socket = getSocket()
          socket.emit('accept_ride', {
            rideId: rideId,
            customerId: data.booking.customerId, // ensure backend returns booking details
            driverName: session.user.name,
            vehicleDetails: "Assigned Vehicle" // from DB later
          })
        }
        
        // Redirect to the "Live Trip Tracking" view for the driver
        router.push(`/partner/dashboard/rides/${rideId}`)
      } else {
        toast.error(data.error || "Failed to accept ride")
        // If someone else accepted it, refresh the list
        fetchRides()
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setAcceptingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#f5f5f5]">Available Ride Requests</h2>
        <button 
          onClick={() => fetchRides(true)}
          disabled={refreshing}
          className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a] rounded-lg text-[#9ca3af] hover:text-[#f5f5f5] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin text-blue-500" : ""} />
        </button>
      </div>

      {rides.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-xl text-center">
          <p className="text-[#9ca3af] font-medium">No available rides in your area right now.</p>
          <p className="text-sm text-[#9ca3af] mt-2">The list updates automatically every 15 seconds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {rides.map((ride) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium capitalize rounded-lg border border-blue-500/20">
                      {ride.vehicleType}
                    </span>
                    <span className="text-[#9ca3af] text-xs">
                      {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-medium">Est. Fare</p>
                    <p className="text-xs text-[#9ca3af]">(Calculated post-ride)</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-[#0f0f0f] border border-[#2a2a2a] text-blue-500 rounded-lg shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9ca3af] font-medium">Pickup</p>
                      <p className="text-sm text-[#f5f5f5] font-medium line-clamp-2 mt-0.5">{ride.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-[#0f0f0f] border border-[#2a2a2a] text-red-500 rounded-lg shrink-0">
                      <Navigation size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9ca3af] font-medium">Drop</p>
                      <p className="text-sm text-[#f5f5f5] font-medium line-clamp-2 mt-0.5">{ride.drop}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptRide(ride._id)}
                  disabled={acceptingId === ride._id}
                  className="w-full py-2.5 bg-blue-600 hover:opacity-90 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                >
                  {acceptingId === ride._id ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Accept Ride
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
