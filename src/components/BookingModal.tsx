"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Phone, Car, Navigation, ChevronRight, LocateFixed, Loader2, Map } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'

// Dynamically import the map to avoid SSR issues with Leaflet window object
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

interface BookingModalProps {
  open: boolean
  onClose: () => void
  onRequireLogin?: () => void
}

const vehicleTypes = [
  "Bike", "Car", "Auto", "SUV", "Loader", "Bus", "Truck"
]

// Custom Hook for clicking outside an element
function useOnClickOutside(ref: React.RefObject<HTMLDivElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface LocationInputProps {
  label: string
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (val: string) => void
  showCurrentLocation?: boolean
  inputColor: string
  onMapClick?: () => void
}

const LocationInput = ({ label, icon, placeholder, value, onChange, showCurrentLocation, inputColor, onMapClick }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(dropdownRef, () => setShowDropdown(false))

  // Debounced search using OpenStreetMap Nominatim API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (value && value.length > 2 && showDropdown) {
        setLoading(true)
        try {
          // Using free OSM API for suggestions
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`)
          const data = await res.json()
          setSuggestions(data)
        } catch (error) {
          console.error("Failed to fetch suggestions", error)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [value, showDropdown])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        // Reverse geocode to get a readable address
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        const data = await res.json()
        
        if (data && data.display_name) {
          onChange(data.display_name)
          setShowDropdown(false)
          toast.success("Location detected!")
        } else {
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
      } catch (error) {
        toast.error("Failed to get address from coordinates")
      } finally {
        setFetchingLocation(false)
      }
    }, () => {
      toast.error("Unable to retrieve your location. Please allow permissions.")
      setFetchingLocation(false)
    })
  }

  const handleSelect = (address: string) => {
    onChange(address)
    setShowDropdown(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex justify-between items-end mb-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        {onMapClick && (
          <button 
            type="button" 
            onClick={onMapClick}
            className={`text-[10px] font-bold uppercase tracking-wider text-${inputColor}-400 flex items-center gap-1 hover:text-${inputColor}-300 transition-colors`}
          >
            <Map size={12} /> Choose on Map
          </button>
        )}
      </div>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <div className={`absolute left-4 top-3.5 text-${inputColor}-500`}>
            {icon}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className={`w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-${showCurrentLocation ? '12' : '4'} py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-${inputColor}-500 focus:ring-1 focus:ring-${inputColor}-500 transition-all text-sm`}
            required
          />
          
          {showCurrentLocation && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={fetchingLocation}
              className="absolute right-3 top-2.5 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              title="Use Current Location"
            >
              {fetchingLocation ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (value.length > 2) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm flex justify-center items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Searching...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(s.display_name)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                >
                  <p className="text-sm text-gray-200 line-clamp-2">{s.display_name}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const BookingModal = ({ open, onClose, onRequireLogin }: BookingModalProps) => {
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [mobile, setMobile] = useState('')
  const [vehicle, setVehicle] = useState('Car')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapPickerTarget, setMapPickerTarget] = useState<'pickup' | 'drop' | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, drop, mobileNumber: mobile, vehicleType: vehicle })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please login first to book a ride.")
          if (onRequireLogin) {
            onRequireLogin()
          } else {
            onClose() // Close modal so they can login via main screen
          }
        } else if (res.status === 409 && data.activeBookingId) {
          toast.error("You already have an active ride request!")
          onClose()
          router.push(`/booking/${data.activeBookingId}/tracking`)
        } else {
          toast.error(data.error || 'Failed to create booking')
        }
        setIsSubmitting(false)
        return
      }

      toast.success("Booking created! Finding a driver...")
      
      // Emit via socket to notify drivers instantly
      if (session?.user) {
        const socket = getSocket();
        
        // Ensure user is registered as customer
        socket.emit('register_user', {
          userId: session.user.id,
          role: session.user.role
        });

        // Emit the ride request
        socket.emit('request_ride', {
          rideId: data.bookingId,
          pickup: pickup,
          drop: drop,
          fare: "TBD", // You could calculate this beforehand
          customerName: session.user.name
        });
      }

      onClose()
      
      // Redirect to the new tracking page
      router.push(`/booking/${data.bookingId}/tracking`)
      
    } catch (error) {
      toast.error('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
                  
                  {/* Enhanced Pickup Location */}
                  <LocationInput
                    label="Pickup Location"
                    icon={<MapPin size={18} />}
                    placeholder="Search pickup or use current..."
                    value={pickup}
                    onChange={setPickup}
                    showCurrentLocation={true}
                    inputColor="blue"
                    onMapClick={() => setMapPickerTarget('pickup')}
                  />

                  {/* Enhanced Drop Location */}
                  <LocationInput
                    label="Drop Location"
                    icon={<Navigation size={18} />}
                    placeholder="Search destination..."
                    value={drop}
                    onChange={setDrop}
                    inputColor="red"
                    onMapClick={() => setMapPickerTarget('drop')}
                  />

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
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                        maxLength={10}
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
    
    {mapPickerTarget && (
      <MapPicker 
        onClose={() => setMapPickerTarget(null)}
        onSelect={(address) => {
          if (mapPickerTarget === 'pickup') setPickup(address)
          if (mapPickerTarget === 'drop') setDrop(address)
        }}
      />
    )}
    </>
  )
}

export default BookingModal
