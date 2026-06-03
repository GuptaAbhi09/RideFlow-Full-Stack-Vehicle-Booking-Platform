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
        <h2 className="text-2xl font-bold text-white">Available Ride Requests</h2>
        <button 
          onClick={() => fetchRides(true)}
          disabled={refreshing}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin text-blue-500" : ""} />
        </button>
      </div>

      {rides.length === 0 ? (
        <div className="bg-[#121212] border border-white/5 p-8 rounded-2xl text-center">
          <p className="text-gray-400">No available rides in your area right now.</p>
          <p className="text-sm text-gray-500 mt-2">The list updates automatically every 15 seconds.</p>
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
                className="bg-[#121212] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-500/20">
                      {ride.vehicleType}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">Est. Fare</p>
                    <p className="text-xs text-gray-500">(Calculated post-ride)</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-blue-500/20 text-blue-500 rounded-lg shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pickup</p>
                      <p className="text-sm text-gray-300 font-medium line-clamp-2">{ride.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-red-500/20 text-red-500 rounded-lg shrink-0">
                      <Navigation size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Drop</p>
                      <p className="text-sm text-gray-300 font-medium line-clamp-2">{ride.drop}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptRide(ride._id)}
                  disabled={acceptingId === ride._id}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
