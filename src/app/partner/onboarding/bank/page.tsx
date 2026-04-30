"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ChevronLeft, Check, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BankOnboardingStep3() {
  const router = useRouter()
  
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [upiId, setUpiId] = useState('')
  
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/bank')
        if (res.ok) {
          const data = await res.json()
          if (data.bank) {
            setBankName(data.bank.bankName)
            setAccountNumber(data.bank.accountNumber)
            setIfscCode(data.bank.ifscCode)
            setAccountHolderName(data.bank.accountHolderName)
            setUpiId(data.bank.upiId || '')
          }
        }
      } catch (err) {
        console.error("Failed to fetch bank details", err)
      }
    }
    fetchExistingData()
  }, [])

  const handleSubmit = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
      setError('Please fill all mandatory bank details')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/partner/onboarding/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bankName, 
          accountNumber, 
          ifscCode, 
          accountHolderName, 
          upiId 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      toast.success("Application submitted successfully!")
      router.push('/partner/dashboard') 
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-8 pb-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-10">
          {/* Step 1 Completed */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 font-bold text-sm">
            <Check size={16} />
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
          {/* Step 2 Completed */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 font-bold text-sm">
            <Check size={16} />
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
          {/* Step 3 Active */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            3
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
              <Landmark className="text-blue-500" size={32} />
              Bank Details
            </h1>
          </div>
          <p className="text-gray-400 mb-8 ml-14">Where should we send your earnings? These details must match your documents.</p>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm ml-14">
              {error}
            </div>
          )}

          <div className="space-y-6 ml-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => { setBankName(e.target.value); setError('') }}
                  placeholder="e.g. HDFC Bank"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value); setError('') }}
                  placeholder="e.g. 50100234567890"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => { setIfscCode(e.target.value.toUpperCase()); setError('') }}
                  placeholder="e.g. HDFC0001234"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => { setAccountHolderName(e.target.value.toUpperCase()); setError('') }}
                  placeholder="e.g. JOHN DOE"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setError('') }}
                placeholder="e.g. 9876543210@ybl"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
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
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              {!isSubmitting && <Check className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
