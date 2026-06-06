"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  MapPin,
  History,
  Clock
} from 'lucide-react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'

interface UserData {
  user: {
    _id: string
    name: string
    email: string
    phoneNumber: string
    role: string
    createdAt: string
  }
}

const UserDetailsPage = () => {
  const router = useRouter()
  const params = useParams() as { id: string }
  const id = params.id
  
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          toast.error("Failed to load user details")
          router.push('/admin/users')
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, router])

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
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Customers</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Account Status: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-3xl mx-auto mb-4 uppercase">
              {data.user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold text-[#f5f5f5]">{data.user.name}</h2>
            <p className="text-xs text-[#9ca3af] mt-1 font-medium capitalize">{data.user.role}</p>
            
            <div className="mt-8 pt-8 border-t border-[#2a2a2a] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af] font-medium">Customer ID</span>
                <span className="text-[#f5f5f5] font-mono">{data.user._id.slice(-8)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af] font-medium">Member Since</span>
                <span className="text-[#f5f5f5]">{new Date(data.user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
            <Shield size={18} className="text-blue-500 shrink-0" />
            <p className="text-xs text-[#9ca3af] leading-relaxed font-medium">
              This is a standard customer account. Standard accounts can book rides but do not have partner-level vehicle or payout access.
            </p>
          </div>
        </div>

        {/* Details & History */}
        <div className="lg:col-span-2 space-y-6">
          <Section icon={UserIcon} title="Basic Information" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email Address" value={data.user.email} />
              <InfoItem icon={Phone} label="Phone Number" value={data.user.phoneNumber || 'Not provided'} />
              <InfoItem icon={Calendar} label="Registration Date" value={new Date(data.user.createdAt).toLocaleString()} />
              <InfoItem icon={MapPin} label="Default Location" value="Not set" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

const Section = ({ icon: Icon, title, children, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2.5 rounded-lg ${color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#2a2a2a] text-[#9ca3af]'}`}>
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-semibold text-[#f5f5f5]">{title}</h2>
    </div>
    {children}
  </motion.div>
)

const InfoItem = ({ icon: Icon, label, value }: any) => (
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
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default UserDetailsPage
