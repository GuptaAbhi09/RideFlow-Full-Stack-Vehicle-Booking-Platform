"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  Banknote,
  Hash,
  AlertCircle,
  ArrowRight,
  LucideIcon,
  Car,
  TrendingUp,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface PartnerData {
  user: {
    _id: string
    name: string
    email: string
    phoneNumber: string
    partnerOnboardingStep: number
    partnerStatus: string
    createdAt: string
  }
  bankDetails: {
    bankName: string
    accountNumber: string
    ifscCode: string
    accountHolderName: string
    upiId: string
  } | null
  documents: {
    aadharUrl: string
    licenseUrl: string
    rcUrl: string
    profilePicUrl: string
    status: string
  } | null
  vehicle: {
    vehicleType: string
    vehicleModel: string
    plateNumber: string
    baseFare: number
    pricePerKm: number
    waitingCharge: number
    imageUrl: string
  } | null
}

const PartnerReviewPage = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await fetch(`/api/admin/partners/${id}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          toast.error("Failed to load partner details")
          router.push('/admin/dashboard')
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchPartner()
  }, [id, router])

  const handleAction = async (status: 'approved' | 'rejected') => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: rejectionReason })
      })

      if (res.ok) {
        toast.success(`Partner ${status} successfully`)
        router.push('/admin/dashboard')
      } else {
        toast.error(`Failed to ${status} partner`)
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
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            data.user.partnerStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
            data.user.partnerStatus === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
            'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            Current Status: {data.user.partnerStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Profile */}
          <Section icon={User} title="Partner Profile" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={User} label="Full Name" value={data.user.name} />
              <InfoItem icon={Mail} label="Email Address" value={data.user.email} />
              <InfoItem icon={Phone} label="Phone Number" value={data.user.phoneNumber || 'Not provided'} />
              <InfoItem icon={Calendar} label="Joined On" value={new Date(data.user.createdAt).toLocaleDateString()} />
            </div>
          </Section>

          {/* Section 2: Bank Details */}
          <Section icon={CreditCard} title="Bank & Payout Information" color="green">
            {data.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={Banknote} label="Bank Name" value={data.bankDetails.bankName} />
                <InfoItem icon={User} label="A/C Holder Name" value={data.bankDetails.accountHolderName} />
                <InfoItem icon={Hash} label="Account Number" value={data.bankDetails.accountNumber} />
                <InfoItem icon={ShieldCheck} label="IFSC Code" value={data.bankDetails.ifscCode} />
                <InfoItem icon={ArrowRight} label="UPI ID" value={data.bankDetails.upiId || 'None'} />
              </div>
            ) : (
              <EmptySection message="No bank details found" />
            )}
          </Section>

          {/* Section 2.5: Vehicle Details */}
          <Section icon={Car} title="Registered Vehicle Details" color="blue">
            {data.vehicle ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem icon={Car} label="Vehicle Type" value={data.vehicle.vehicleType} />
                <InfoItem icon={FileText} label="Model Name" value={data.vehicle.vehicleModel} />
                <InfoItem icon={Hash} label="Plate Number" value={data.vehicle.plateNumber} />
              </div>
            ) : (
              <EmptySection message="No vehicle registered yet" />
            )}
          </Section>

          {/* Section 3: Document Gallery */}
          <Section icon={FileText} title="Identification Documents" color="red">
            {data.documents ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <DocumentCard label="Aadhar Card" url={data.documents.aadharUrl} />
                <DocumentCard label="Driving License" url={data.documents.licenseUrl} />
                <DocumentCard label="Vehicle RC" url={data.documents.rcUrl} />
                <DocumentCard label="Profile Picture" url={data.documents.profilePicUrl} />
              </div>
            ) : (
              <EmptySection message="No documents uploaded" />
            )}
          </Section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Final Review</h3>
              <p className="text-gray-400 text-sm mb-6">Verify all documents and details before making a decision.</p>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAction('approved')}
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle size={18} />
                  Approve Application
                </button>
                
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="w-full py-3 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-gray-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle size={18} />
                  Reject Application
                </button>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                Note: Approving this partner will automatically move them to the Video KYC stage. Ensure Aadhar and License details match the profile name.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121212] border border-white/10 p-8 rounded-[2rem] max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2 text-center">Reject Application?</h3>
              <p className="text-gray-400 text-center text-sm mb-6">Please provide a reason for the partner to correct.</p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Aadhar card image is blurred..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-red-500 transition-all resize-none mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction('rejected')}
                  disabled={!rejectionReason || submitting}
                  className="flex-1 py-4 bg-red-600 rounded-2xl font-bold text-white hover:bg-red-500 disabled:bg-red-900 transition-all shadow-lg shadow-red-600/20"
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
    className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-6 shadow-xl"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-bold text-white uppercase tracking-tight">{title}</h2>
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
  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
    <div className="flex items-center gap-2 mb-0.5 text-gray-500">
      <Icon size={12} />
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xs font-medium text-white">{value}</p>
  </div>
)

const DocumentCard = ({ label, url }: { label: string, url: string }) => (
  <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
    <div className="aspect-[3/2] relative">
      <Image 
        src={url} 
        alt={label} 
        fill 
        className="object-cover opacity-60 group-hover:opacity-100 transition-all group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-2">
        <p className="text-[9px] font-bold text-white uppercase tracking-tighter">{label}</p>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-2 right-2 p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  </div>
)

const EmptySection = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
    <AlertCircle size={24} className="text-gray-600 mb-2" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default PartnerReviewPage
