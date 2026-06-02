"use client"

import React, { useState } from 'react'
import { MapPin, Navigation, Car, Users } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import MapTracking to avoid SSR issues
const MapTracking = dynamic(() => import('./MapTracking'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-500">Loading Map...</div> })

interface TrackingDashboardProps {
  booking: {
    id: string
    status: string
    pickup: string
    drop: string
    vehicleType: string
  }
}

const TrackingDashboard = ({ booking }: TrackingDashboardProps) => {
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)

  return (
    <div className="h-screen bg-[#0a0a0a] pt-[72px] flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Map */}
      <div className="w-full md:w-1/2 lg:w-[55%] relative h-[50vh] md:h-full z-0 bg-[#121212] border-r border-white/10">
        <MapTracking 
          pickupAddress={booking.pickup} 
          dropAddress={booking.drop} 
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
            {booking.status === 'searching' ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">Finding Driver</span>
              </div>
            ) : (
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wide uppercase border border-blue-500/20">
                {booking.status}
              </span>
            )}
          </div>
        </div>

        {/* Estimation & Available Drivers (Mock Data) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Trip Estimate</p>
              <Navigation size={14} className="text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-2xl font-extrabold">{duration || '--'}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">{distance || 'Calculating...'}</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border border-emerald-500/20 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Network</p>
              <Users size={14} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-2xl font-extrabold">5</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">Drivers Nearby</span>
          </div>
        </div>

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

      </div>

    </div>
  )
}

export default TrackingDashboard
