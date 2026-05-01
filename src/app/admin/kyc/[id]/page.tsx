"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Video, 
  CheckCircle, 
  XCircle, 
  User, 
  ShieldCheck,
  AlertCircle,
  PhoneOff,
  Video as VideoIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import Image from 'next/image'

import VideoCall from '@/app/zego/VideoCall'

interface PartnerData {
  user: {
    _id: string
    name: string
    email: string
    videoKycStatus: string
    videoKycRoomId: string
  }
}

const AdminKycPage = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [callActive, setCallActive] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/partners/${id}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleStartCallClick = async () => {
    if (!data) return
    
    // If we don't have a room ID yet, initiate it
    if (!data.user.videoKycRoomId) {
      await initiateKyc()
    } else {
      // Just activate the UI
      setCallActive(true)
    }
  }

  const initiateKyc = async () => {
    try {
      const res = await fetch(`/api/kyc/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const json = await res.json()
        setData(prev => prev ? { ...prev, user: { ...prev.user, videoKycStatus: 'in_progress', videoKycRoomId: json.roomId } } : null)
        // Automatically start call after initiation
        setCallActive(true)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to initialize KYC room")
      }
    } catch (error) {
      console.error("Failed to initiate KYC:", error)
      toast.error("Network error while initializing KYC")
    }
  }

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: rejectionReason })
      })

      if (res.ok) {
        toast.success(`Video KYC ${status} successfully`)
        router.push('/admin/dashboard')
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
      setShowDecisionModal(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              Live Session: {data.user.videoKycRoomId}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Video Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className={`bg-[#121212] border border-white/5 relative shadow-2xl transition-all ${
            callActive ? 'h-[600px] rounded-3xl' : 'aspect-video rounded-[2.5rem]'
          }`}>
            {/* Ready for Video Screen */}
            <AnimatePresence>
              {!callActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-center p-8 z-10 bg-[#121212] rounded-[2.5rem]"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <VideoIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ready for Video Verification?</h2>
                    <p className="text-gray-400 mb-8">Ensure you have a stable internet connection and the partner is ready for the call.</p>
                    <button 
                      onClick={handleStartCallClick}
                      className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                      Start Call Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video Call Interface - Always present in DOM if room exists */}
            <div className={`w-full h-full relative rounded-3xl overflow-hidden ${callActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {data.user.videoKycRoomId && (
                <VideoCall roomID={data.user.videoKycRoomId} active={callActive} />
              )}
              
              {/* Controls overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[80]">
                <button 
                  onClick={() => setCallActive(false)}
                  className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-xl border-none cursor-pointer"
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Checklist removed */}
        </div>

        {/* Info & Decisions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg shadow-blue-600/20">
                {data.user.name.charAt(0)}
              </div>
              <h3 className="font-bold text-white truncate">{data.user.name}</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{data.user.email}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  setRejectionReason('')
                  setShowDecisionModal(true)
                }}
                className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                End Session & Review
              </button>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Note</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Video KYC is the final security step. Ensure the partner is in a well-lit area and their identity documents are clearly visible during the call.
            </p>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      <AnimatePresence>
        {showDecisionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121212] border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2 text-center">Final KYC Decision</h3>
              <p className="text-gray-400 text-center text-sm mb-8">Once confirmed, the partner will be notified of the result.</p>
              
              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => handleDecision('approved')}
                  disabled={submitting}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle size={20} />
                  Approve Verification
                </button>

                <div className="h-px bg-white/5 my-2" />

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rejection Reason (If any)</p>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Identification was not clear enough..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-red-500 transition-all resize-none"
                  />
                  <button 
                    onClick={() => handleDecision('rejected')}
                    disabled={!rejectionReason || submitting}
                    className="w-full py-4 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-gray-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
                  >
                    <XCircle size={20} />
                    Reject Verification
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowDecisionModal(false)}
                className="w-full text-gray-500 text-sm font-medium hover:text-white transition-colors"
              >
                Cancel & Return to Call
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ChecklistItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
    <div className="w-5 h-5 rounded border border-white/20 group-hover:border-blue-500 transition-all flex items-center justify-center">
      <CheckCircle size={12} className="text-blue-500 opacity-0 group-hover:opacity-100" />
    </div>
    <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{label}</span>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default AdminKycPage
