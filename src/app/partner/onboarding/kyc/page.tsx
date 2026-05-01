"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Video, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  XCircle, 
  AlertCircle,
  LayoutDashboard,
  RefreshCcw
} from 'lucide-react'
import VideoCall from '@/app/zego/VideoCall'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function VideoKYCPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCallActive, setIsCallActive] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchUserStatus = async () => {
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      }
    } catch (error) {
      console.error("Failed to fetch user status", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserStatus()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status])

  const handleStartCall = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/kyc/${session?.user?.id}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const data = await res.json()
        setUserData((prev: any) => ({ ...prev, videoKycStatus: 'in_progress', videoKycRoomId: data.roomId }))
        setIsCallActive(true)
      } else {
        toast.error("Failed to initiate KYC. Please try again.")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const kycStatus = userData?.videoKycStatus || 'not_required'

  // Standard return with hidden VideoCall for stability
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Video Call Interface - Always present in DOM if active once */}
      <div className={`fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 transition-all duration-500 ${
        isCallActive && userData?.videoKycRoomId ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'
      }`}>
        <div className="w-full max-w-5xl aspect-video bg-[#121212] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
          {userData?.videoKycRoomId && (
            <VideoCall roomID={userData.videoKycRoomId} active={isCallActive} />
          )}
          
          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Verification</span>
          </div>
        </div>
        <p className="mt-8 text-gray-500 text-sm animate-pulse">Please do not refresh or close this page during the call.</p>
        
        {/* End Call Button for Partner (Emergency/User-led) */}
        <button 
          onClick={() => setIsCallActive(false)}
          className="mt-6 px-6 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full text-xs transition-all border border-white/10"
        >
          End Call
        </button>
      </div>

      <div className="pt-32 pb-12 px-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Status-based content */}
          {userData?.partnerStatus === 'pending' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} className="text-yellow-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-4">Awaiting Admin Approval</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">Your documents have been submitted successfully! Once our admin team verifies them, the Video KYC step will be unlocked for you.</p>
              <div className="space-y-4 text-left bg-white/5 rounded-2xl p-6 mb-8">
                <ChecklistItem text="Vehicle Details Submitted" completed />
                <ChecklistItem text="Documents Uploaded" completed />
                <ChecklistItem text="Bank Details Added" completed />
                <div className="flex items-center gap-3 text-blue-400 font-medium">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-1" />
                  <span>Verification in Progress...</span>
                </div>
              </div>
              <Link href="/partner/dashboard" className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-center">
                Go to Dashboard
              </Link>
            </motion.div>
          ) : kycStatus === 'approved' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-4">KYC Verified Successfully</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">Congratulations! Your video verification is complete. Our team is now finalizing your partner account.</p>
              <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 mb-8 text-center">
                <p className="text-sm text-green-400 font-medium">Next Step: Vehicle Review & Final Activation</p>
              </div>
              <Link href="/partner/dashboard" className="block w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all text-center">
                Go to Dashboard
              </Link>
            </motion.div>
          ) : kycStatus === 'rejected' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-4">KYC Verification Failed</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">Unfortunately, your video verification was not successful. Please review the reason below and try again.</p>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mb-8 text-left">
                <h4 className="text-red-400 font-bold mb-1 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} />
                  Rejection Reason:
                </h4>
                <p className="text-sm text-gray-400">{userData.videoKycRejectionReason || "Identity verification failed."}</p>
              </div>
              <button onClick={handleStartCall} disabled={submitting} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                {submitting ? <RefreshCcw size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                Retry Video KYC
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video size={40} className="text-blue-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Final Step: Video KYC</h1>
              <p className="text-gray-400 mb-8">Your documents are approved! You are now eligible for the 1-on-1 video verification call.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                <FeatureCard icon={<ShieldCheck className="text-green-500" size={24} />} title="Identity Check" desc="Keep your original Aadhar and License ready." />
                <FeatureCard icon={<Video className="text-blue-500" size={24} />} title="Live Call" desc="A short 2-minute call with our verification officer." />
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mb-10 text-left">
                <h4 className="text-blue-400 font-bold mb-2 text-sm flex items-center gap-2">
                  <Clock size={16} />
                  Preparation Guide:
                </h4>
                <ul className="text-xs text-gray-400 space-y-2 list-disc ml-5">
                  <li>Stable internet connection is required.</li>
                  <li>Sit in a well-lit area (avoid backlighting).</li>
                  <li>Partner holding the camera must match the photo.</li>
                </ul>
              </div>
              <button onClick={handleStartCall} disabled={submitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                {submitting ? "Initiating..." : "Start Video KYC Call"}
                {!submitting && <ChevronRight size={20} />}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
const StatusCard = ({ icon, title, description, bgColor, children }: any) => (
  <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-12 px-6 flex justify-center">
    <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121212] border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
      >
        <div className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {icon}
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-4">{title}</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">{description}</p>
        {children}
      </motion.div>
    </div>
  </div>
)

const ChecklistItem = ({ text, completed }: { text: string, completed: boolean }) => (
  <div className="flex items-center gap-3 text-gray-300 text-sm">
    <CheckCircle2 size={18} className={completed ? "text-green-500" : "text-gray-600"} />
    <span>{text}</span>
  </div>
)

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <div className="mb-3">{icon}</div>
    <h3 className="text-white font-bold mb-1 text-sm">{title}</h3>
    <p className="text-[10px] text-gray-500">{desc}</p>
  </div>
)
