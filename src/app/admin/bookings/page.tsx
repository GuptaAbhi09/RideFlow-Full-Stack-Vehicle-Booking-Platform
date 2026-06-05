"use client"

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  MapPin, 
  Navigation, 
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface PopulatedUser {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  vehicleType?: string
}

interface AdminBooking {
  _id: string
  customerId: PopulatedUser | null
  driverId: PopulatedUser | null
  pickup: string
  drop: string
  vehicleType: string
  status: string
  fare: number
  distance: string
  createdAt: string
}

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/admin/bookings')
        if (res.ok) {
          const data = await res.json()
          setBookings(data)
        } else {
          toast.error("Failed to load bookings")
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customerId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pickup.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="text-blue-500" />
            Live Platform Bookings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Monitor all active and past rides across the city.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="searching">Searching</option>
            <option value="accepted">Accepted</option>
            <option value="started">Live (Started)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
          <div className="col-span-3">Ride ID & Time</div>
          <div className="col-span-4">Route Details</div>
          <div className="col-span-3">Customer & Driver</div>
          <div className="col-span-2 text-right">Fare & Status</div>
        </div>

        {filteredBookings.length > 0 ? filteredBookings.map((booking, idx) => (
          <motion.div
            key={booking._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 items-center px-6 py-5 bg-[#121212] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all group"
          >
            {/* ID & Time */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{booking._id.slice(-8).toUpperCase()}</span>
                {booking.status === 'started' && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300 font-medium">
                {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Route */}
            <div className="md:col-span-4 flex flex-col gap-2 relative pl-2 md:pl-0">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-white/5 z-0 md:hidden"></div>
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-1 bg-[#0a0a0a] rounded-full mt-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-300 line-clamp-1">{booking.pickup}</p>
              </div>
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-1 bg-[#0a0a0a] rounded-full mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-300 line-clamp-1">{booking.drop}</p>
              </div>
            </div>

            {/* Users */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Cust</span>
                <span className="text-xs text-gray-200 font-medium">{booking.customerId?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Driver</span>
                <span className="text-xs text-gray-200 font-medium">{booking.driverId?.name || 'Searching...'}</span>
              </div>
            </div>

            {/* Fare & Status */}
            <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-between md:items-end gap-2">
              <h3 className="text-lg font-extrabold text-white">₹{booking.fare?.toFixed(2)}</h3>
              
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                booking.status === 'completed' ? 'bg-gray-500/10 text-gray-400' :
                booking.status === 'started' || booking.status === 'arriving' ? 'bg-emerald-500/10 text-emerald-500' :
                booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {booking.status === 'completed' && <CheckCircle2 size={10} />}
                {booking.status === 'started' && <Navigation size={10} />}
                {booking.status === 'cancelled' && <XCircle size={10} />}
                {(booking.status === 'searching' || booking.status === 'accepted') && <Clock size={10} />}
                
                {booking.status === 'started' ? 'Live' : booking.status}
              </div>
            </div>
            
          </motion.div>
        )) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <AlertCircle className="text-gray-600 mb-3" size={32} />
            <p className="text-gray-400 font-medium">No bookings found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default AdminBookingsPage
