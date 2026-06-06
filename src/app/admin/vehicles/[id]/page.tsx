"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Mail,
  Phone,
  Banknote,
  Hash,
  AlertCircle,
  Car,
  TrendingUp,
  Clock,
  LucideIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface VehicleData {
  _id: string
  vehicleType: string
  vehicleModel: string
  plateNumber: string
  baseFare: number
  pricePerKm: number
  waitingCharge: number
  imageUrl: string
  status: string
  createdAt: string
  owner: {
    _id: string
    name: string
    email: string
    phoneNumber: string
    partnerOnboardingStep: number
  }
}

const VehicleReviewPage = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [data, setData] = useState<VehicleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/admin/vehicles/${id}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          toast.error("Failed to load vehicle details")
          router.push('/admin/dashboard')
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchVehicle()
  }, [id, router])

  const handleAction = async (status: 'approved' | 'rejected') => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: rejectionReason })
      })

      if (res.ok) {
        toast.success(`Vehicle ${status} successfully`)
        router.push('/admin/dashboard')
      } else {
        toast.error(`Failed to ${status} vehicle`)
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
      setShowRejectModal(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!data) return null

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            data.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
            data.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
            'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            Status: {data.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Owner Profile */}
          <Section icon={User} title="Owner Profile" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={User} label="Full Name" value={data.owner.name} />
              <InfoItem icon={Mail} label="Email Address" value={data.owner.email} />
              <InfoItem icon={Phone} label="Phone Number" value={data.owner.phoneNumber || 'Not provided'} />
            </div>
          </Section>

          {/* Section 2: Vehicle & Pricing */}
          <Section icon={Car} title="Vehicle & Pricing" color="red">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem icon={Car} label="Vehicle Type" value={data.vehicleType} />
                <InfoItem icon={Car} label="Model Name" value={data.vehicleModel} />
                <InfoItem icon={Hash} label="Plate Number" value={data.plateNumber} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                <InfoItem icon={Banknote} label="Base Fare" value={`₹${data.baseFare}`} />
                <InfoItem icon={TrendingUp} label="Price Per Km" value={`₹${data.pricePerKm}`} />
                <InfoItem icon={Clock} label="Waiting Charge / Min" value={`₹${data.waitingCharge}`} />
              </div>

              {data.imageUrl && data.imageUrl !== "https://placeholder.com/default-vehicle.png" && (
                <div className="border-t border-[#2a2a2a] pt-4">
                  <p className="text-xs font-medium text-[#9ca3af] mb-3">Vehicle Photo</p>
                  <div className="w-full max-w-md aspect-video relative rounded-xl overflow-hidden border border-[#2a2a2a] group">
                    <Image 
                      src={data.imageUrl} 
                      alt="Vehicle" 
                      fill 
                      className="object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105"
                    />
                    <a 
                      href={data.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 p-2 bg-[#1a1a1a]/80 backdrop-blur-md rounded-lg text-[#f5f5f5] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#2a2a2a]"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">Final Activation</h3>
              <p className="text-[#9ca3af] text-sm mb-6">Approving this vehicle will activate the partner's account and make them LIVE on the platform.</p>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAction('approved')}
                  disabled={submitting}
                  className="w-full py-2.5 bg-green-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-opacity flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle size={18} />
                  Approve & Go Live
                </button>
                
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-[#9ca3af] rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle size={18} />
                  Reject Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f0f0f]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-xl max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2 text-center">Reject Vehicle?</h3>
              <p className="text-[#9ca3af] text-center text-sm mb-6">Provide a reason so the partner can fix it.</p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Image is not clear, update rates..."
                className="w-full h-32 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 text-[#f5f5f5] focus:outline-none focus:border-red-500 transition-colors resize-none mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg font-medium text-[#9ca3af] hover:text-[#f5f5f5] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction('rejected')}
                  disabled={!rejectionReason || submitting}
                  className="flex-1 py-2.5 bg-red-600 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SectionProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  color: 'blue' | 'green' | 'red'
}

const Section = ({ icon: Icon, title, children, color }: SectionProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2.5 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-semibold text-[#f5f5f5]">{title}</h2>
    </div>
    {children}
  </motion.div>
)

interface InfoItemProps {
  icon: LucideIcon
  label: string
  value: string
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
    <div className="flex items-center gap-2 mb-0.5 text-[#9ca3af]">
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-sm font-medium text-[#f5f5f5] mt-1">{value}</p>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default VehicleReviewPage
