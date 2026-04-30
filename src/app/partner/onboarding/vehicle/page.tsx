"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Car, Bike, Bus, Truck, ChevronRight, Check, CarTaxiFront } from 'lucide-react'

export default function VehicleOnboardingStep1() {
  const router = useRouter()
  
  const [vehicleType, setVehicleType] = useState<string | null>(null)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/vehicle')
        if (res.ok) {
          const data = await res.json()
          if (data.vehicle) {
            setVehicleType(data.vehicle.vehicleType.toLowerCase() === 'auto' ? 'auto' : data.vehicle.vehicleType.toLowerCase())
            setVehicleNumber(data.vehicle.plateNumber)
            setVehicleModel(data.vehicle.vehicleModel)
          }
        }
      } catch (err) {
        console.error("Failed to fetch vehicle", err)
      }
    }
    fetchExistingData()
  }, [])

  const vehicleTypes = [
    { id: 'car', label: 'Car / SUV', icon: Car },
    { id: 'bike', label: 'Bike', icon: Bike },
    { id: 'auto', label: 'Auto', icon: CarTaxiFront },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'truck', label: 'Truck', icon: Truck },
  ]

  const handleContinue = async () => {
    if (!vehicleType) {
      setError('Please select a vehicle type')
      return
    }
    if (!vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number')
      return
    }
    if (!vehicleModel.trim()) {
      setError('Please enter your vehicle model')
      return
    }
    
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/partner/onboarding/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType, vehicleNumber, vehicleModel })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save vehicle details')
      }

      router.push('/partner/onboarding/documents')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-8 pb-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
            1
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-gray-500 font-bold text-sm">
            2
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-gray-500 font-bold text-sm">
            3
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">Add Your Vehicle</h1>
          <p className="text-gray-400 mb-8">Tell us about the vehicle you'll be using to drive with RideFlow.</p>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                Select Vehicle Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {vehicleTypes.map((type) => {
                  const isSelected = vehicleType === type.id
                  const Icon = type.icon
                  return (
                    <div
                      key={type.id}
                      onClick={() => {
                        setVehicleType(type.id)
                        setError('')
                      }}
                      className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check size={10} />
                        </div>
                      )}
                      <Icon size={32} />
                      <span className="text-xs font-bold uppercase tracking-wider">{type.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-5">
              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(e) => {
                    setVehicleNumber(e.target.value.toUpperCase())
                    setError('')
                  }}
                  placeholder="e.g. MH 12 AB 1234"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono uppercase"
                />
              </div>

              <div>
                <label htmlFor="vehicleModel" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  id="vehicleModel"
                  value={vehicleModel}
                  onChange={(e) => {
                    setVehicleModel(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. Toyota Innova Crysta"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 group cursor-pointer ${
                isSubmitting 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
              {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
