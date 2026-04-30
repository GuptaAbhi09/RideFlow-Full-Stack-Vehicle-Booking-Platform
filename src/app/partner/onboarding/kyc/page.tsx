"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Video, ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import VideoCall from '@/app/zego/VideoCall'
import toast from 'react-hot-toast'

export default function VideoKYCPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCallActive, setIsCallActive] = useState(false)
  const [canJoinCall, setCanJoinCall] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await fetch('/api/user/me') // Assuming there's an endpoint to get current user status
        if (res.ok) {
          const data = await res.json()
          setUserData(data)
          
          // Only allow Video KYC if Admin has approved the previous 3 steps
          if (data.partnerStatus === 'approved' && data.partnerOnboardingStep >= 3) {
            setCanJoinCall(true)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user status", error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserStatus()
    }
  }, [status])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!canJoinCall && !isCallActive) {
    return (
      <div className="pt-8 pb-12 px-6 flex justify-center">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-yellow-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4">Awaiting Admin Approval</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Your documents have been submitted successfully! Once our admin team verifies them, 
              the Video KYC step will be unlocked for you.
            </p>
            <div className="space-y-4 text-left bg-white/5 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 size={20} className="text-green-500" />
                <span>Vehicle Details Submitted</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 size={20} className="text-green-500" />
                <span>Documents Uploaded</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 size={20} className="text-green-500" />
                <span>Bank Details Added</span>
              </div>
              <div className="flex items-center gap-3 text-blue-400 font-medium">
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-1" />
                <span>Verification in Progress...</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/partner/dashboard')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isCallActive && session?.user?.id) {
    return <VideoCall roomID={`kyc_${session.user.id}`} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Video KYC Verification</h1>
          <p className="text-gray-400 mb-8">
            Your documents have been approved! You are now eligible for the final step: Video KYC.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <ShieldCheck className="text-green-500 mb-3" size={24} />
              <h3 className="text-white font-bold mb-1">Identity Check</h3>
              <p className="text-xs text-gray-500">Keep your original Aadhar and License ready for verification.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <Video className="text-blue-500 mb-3" size={24} />
              <h3 className="text-white font-bold mb-1">Live Interaction</h3>
              <p className="text-xs text-gray-500">You will have a short 1-on-1 video call with our verification officer.</p>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mb-10 text-left">
            <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <Clock size={18} />
              Important Instructions:
            </h4>
            <ul className="text-sm text-gray-400 space-y-2 list-disc ml-5">
              <li>Ensure you have a stable internet connection.</li>
              <li>Sit in a well-lit area where your face is clearly visible.</li>
              <li>Keep your original documents handy during the call.</li>
              <li>The call usually takes 2-5 minutes.</li>
            </ul>
          </div>

          <button
            onClick={() => setIsCallActive(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            Start Video KYC Call
            <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
