"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Phone, Car, Navigation, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookingModalProps {
  open: boolean
  onClose: () => void
}

const vehicleTypes = [
  "Bike", "Car", "Auto", "SUV", "Loader", "Bus", "Truck"
]

const BookingModal = ({ open, onClose }: BookingModalProps) => {
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [mobile, setMobile] = useState('')
  const [vehicle, setVehicle] = useState('Car')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pickup || !drop || !mobile || !vehicle) {
      toast.error('Please fill in all fields')
      return
    }

    if (mobile.length < 10) {
      toast.error('Please enter a valid mobile number')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Booking requested! Our team will contact you shortly.")
      setPickup('')
      setDrop('')
      setMobile('')
      setVehicle('Car')
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121212] border border-white/10 w-full max-w-md rounded-3xl p-8 relative pointer-events-auto shadow-2xl"
            >
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Book Your Ride</h2>
                <p className="text-gray-400 text-sm">Enter your details below and we'll get you moving instantly.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-blue-500">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Current Location"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Drop Location */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Drop Location
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-red-500">
                        <Navigation size={18} />
                      </div>
                      <input
                        type="text"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        placeholder="Destination"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-gray-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter 10-digit number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Vehicle Type
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-gray-400">
                        <Car size={18} />
                      </div>
                      <select
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
                        required
                      >
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-4 text-gray-500 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm Booking Request
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BookingModal
