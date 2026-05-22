"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ChevronLeft, Check, DollarSign, UploadCloud, CheckCircle2, ImageIcon, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function PricingOnboardingStep6() {
  const router = useRouter()
  
  const [baseFare, setBaseFare] = useState('')
  const [pricePerKm, setPricePerKm] = useState('')
  const [waitingCharge, setWaitingCharge] = useState('')
  const [vehicleImage, setVehicleImage] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/pricing')
        if (res.ok) {
          const data = await res.json()
          if (data.vehicle) {
            setBaseFare(data.vehicle.baseFare?.toString() || '')
            setPricePerKm(data.vehicle.pricePerKm?.toString() || '')
            setWaitingCharge(data.vehicle.waitingCharge?.toString() || '')
            if (data.vehicle.imageUrl && data.vehicle.imageUrl !== "https://placeholder.com/default-vehicle.png") {
              setExistingImageUrl(data.vehicle.imageUrl)
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch pricing details", err)
      }
    }
    fetchExistingData()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVehicleImage(e.target.files[0])
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!baseFare || !pricePerKm || !waitingCharge) {
      setError('Please fill all pricing details')
      return
    }

    if (!vehicleImage && !existingImageUrl) {
      setError('Please upload a photo of your vehicle')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('baseFare', baseFare)
      formData.append('pricePerKm', pricePerKm)
      formData.append('waitingCharge', waitingCharge)
      if (vehicleImage) {
        formData.append('vehicleImage', vehicleImage)
      }

      const res = await fetch('/api/partner/onboarding/pricing', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit pricing')
      }

      toast.success("Pricing details saved successfully!")
      router.push('/partner/dashboard') 
    } catch (err: any) {
      setError(err.message || "Failed to submit pricing")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isImageDone = vehicleImage || existingImageUrl

  return (
    <div className="pt-8 pb-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 font-bold text-sm">
            <Check size={16} />
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 font-bold text-sm">
            <Check size={16} />
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            6
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <DollarSign className="text-blue-500" size={32} />
              Fare Pricing
            </h1>
          </div>
          <p className="text-gray-400 mb-8 ml-14">Set your pricing rates and upload a clear photo of your vehicle.</p>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm ml-14">
              {error}
            </div>
          )}

          <div className="space-y-6 ml-14">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Base Fare (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={baseFare}
                    onChange={(e) => { setBaseFare(e.target.value); setError('') }}
                    placeholder="50"
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Price Per Km (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={pricePerKm}
                    onChange={(e) => { setPricePerKm(e.target.value); setError('') }}
                    placeholder="12"
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Waiting Charge / Min (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
                <input
                  type="number"
                  value={waitingCharge}
                  onChange={(e) => { setWaitingCharge(e.target.value); setError('') }}
                  placeholder="2"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Vehicle Image Upload */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                Vehicle Photo *
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  id="vehicleImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="vehicleImage"
                  className={`block w-full border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                    isImageDone 
                      ? 'bg-blue-600/10 border-blue-500/50 hover:bg-blue-600/20' 
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${isImageDone ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                        {isImageDone ? <CheckCircle2 size={24} /> : <ImageIcon size={24} />}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg transition-colors ${isImageDone ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                          Vehicle Photo
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicleImage ? vehicleImage.name : existingImageUrl ? "Previously Uploaded ✓" : "Clear exterior photo"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                      <UploadCloud size={24} className="mb-1" />
                      <span className="text-xs font-medium">{isImageDone ? 'Change' : 'Browse'}</span>
                    </div>
                  </div>
                </label>
              </div>
              
              {(vehicleImage || existingImageUrl) && (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 relative w-32 h-24">
                   <Image 
                     src={vehicleImage ? URL.createObjectURL(vehicleImage) : existingImageUrl} 
                     alt="Vehicle Preview" 
                     fill 
                     className="object-cover" 
                   />
                </div>
              )}
            </div>

          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSubmitting 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Save Pricing'}
              {!isSubmitting && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
