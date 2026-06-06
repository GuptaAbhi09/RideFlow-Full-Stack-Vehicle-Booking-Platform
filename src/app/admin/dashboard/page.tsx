"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  Video, 
  Car, 
  FileText,
  AlertCircle,
  TrendingUp,
  MoreVertical,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
  platformRevenue: number
}

interface PendingUser {
  _id: string
  name: string
  email: string
  partnerOnboardingStep: number
  videoKycStatus?: string
  createdAt: string
}

interface PendingVehicle {
  _id: string
  vehicleModel: string
  plateNumber: string
  owner: {
    name: string
    email: string
  }
  createdAt: string
}

type TabType = 'reviews' | 'kyc' | 'vehicles'

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingReviews, setPendingReviews] = useState<PendingUser[]>([])
  const [pendingKyc, setPendingKyc] = useState<PendingUser[]>([])
  const [pendingVehicles, setPendingVehicles] = useState<PendingVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('reviews')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setPendingReviews(data.pendingReviews)
          setPendingKyc(data.pendingKyc)
          setPendingVehicles(data.pendingVehicles)
        }
      } catch (error) {
        console.error("Admin dashboard fetch error:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Platform Profit', value: `₹${stats?.platformRevenue.toFixed(2) || 0}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Partners', value: stats?.total || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ]

  const tabs = [
    { id: 'reviews', label: 'Partner Reviews', icon: FileText, count: pendingReviews.length, color: 'blue' },
    { id: 'kyc', label: 'Video KYC', icon: Video, count: pendingKyc.length, color: 'green' },
    { id: 'vehicles', label: 'Vehicle Reviews', icon: Car, count: pendingVehicles.length, color: 'red' },
  ]

  return (
    <div className="pb-12 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f5f5f5]">System Overview</h1>
          <p className="text-[#9ca3af] mt-1 text-sm">Manage partner onboarding and fleet verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f5f5f5] border border-[#2a2a2a] rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 relative overflow-hidden group"
          >
            <div className={`p-2 rounded-lg ${card.bg} ${card.color} w-fit mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-[#9ca3af] text-sm font-medium">{card.label}</p>
            <h3 className="text-2xl font-semibold text-[#f5f5f5] mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-[#1a1a1a] w-full max-w-4xl rounded-xl border border-[#2a2a2a] mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-2.5 rounded-lg font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[#f5f5f5]' 
                : 'text-[#9ca3af] hover:text-[#f5f5f5]'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-[#2a2a2a] rounded-lg"
              />
            )}
            <span className="relative z-10 flex items-center gap-2 text-sm">
              <tab.icon size={16} className={activeTab === tab.id ? `text-${tab.color}-500` : ''} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-500 text-white` 
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content - Row based list */}
      <div className="space-y-4 max-w-5xl mx-auto min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {pendingReviews.length > 0 ? pendingReviews.map((partner) => (
                <PendingRow 
                  key={partner._id}
                  id={partner._id}
                  title={partner.name}
                  subtitle={partner.email}
                  tag={`Step ${partner.partnerOnboardingStep}`}
                  icon={FileText}
                  color="blue"
                  actionText="Review"
                />
              )) : <EmptyState message="No pending partner reviews" />}
            </motion.div>
          )}

          {activeTab === 'kyc' && (
            <motion.div
              key="kyc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {pendingKyc.length > 0 ? pendingKyc.map((partner) => (
                <PendingRow 
                  key={partner._id}
                  id={partner._id}
                  title={partner.name}
                  subtitle={partner.email}
                  tag={partner.videoKycStatus === 'in_progress' ? "Live Call" : "KYC Pending"}
                  icon={Video}
                  color="green"
                  actionText={partner.videoKycStatus === 'in_progress' ? "Join Call" : "Start Call"}
                  isUrgent={partner.videoKycStatus === 'in_progress'}
                />
              )) : <EmptyState message="No pending KYC sessions" />}
            </motion.div>
          )}

          {activeTab === 'vehicles' && (
            <motion.div
              key="vehicles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {pendingVehicles.length > 0 ? pendingVehicles.map((vehicle) => (
                <PendingRow 
                  key={vehicle._id}
                  id={vehicle._id}
                  title={vehicle.vehicleModel}
                  subtitle={vehicle.plateNumber}
                  tag="Inspection"
                  icon={Car}
                  color="red"
                  actionText="Verify"
                  ownerName={vehicle.owner?.name}
                />
              )) : <EmptyState message="No pending vehicle inspections" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface PendingRowProps {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: any
  color: 'blue' | 'green' | 'red'
  actionText: string
  isUrgent?: boolean
  ownerName?: string
}

const PendingRow = ({ id, title, subtitle, tag, icon: Icon, color, actionText, isUrgent, ownerName }: PendingRowProps) => (
  <motion.div
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors group flex items-center justify-between gap-6"
  >
    <div className="flex items-center gap-4 flex-1">
      <div className={`p-2.5 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-[#f5f5f5] group-hover:text-blue-400 transition-colors truncate">{title}</h3>
        <p className="text-xs text-[#9ca3af] truncate">{subtitle}</p>
      </div>
    </div>

    {ownerName && (
      <div className="hidden md:block flex-1">
        <p className="text-xs font-medium text-[#9ca3af] mb-0.5">Owner</p>
        <p className="text-sm font-medium text-[#f5f5f5]">{ownerName}</p>
      </div>
    )}

    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          {isUrgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          <span className={`text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-[#9ca3af]'}`}>
            {tag}
          </span>
        </div>
      </div>

      <Link 
        href={
          color === 'blue' ? `/admin/partners/${id}` : 
          color === 'green' ? `/admin/kyc/${id}` : 
          `/admin/vehicles/${id}`
        }
        className={`px-5 py-2.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-2 ${
          color === 'blue' ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-[#f5f5f5]' :
          color === 'green' ? 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-[#f5f5f5]' :
          'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-[#f5f5f5]'
        }`}
      >
        {actionText}
        <ChevronRight size={14} />
      </Link>
    </div>
  </motion.div>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#2a2a2a] rounded-xl">
    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3 text-[#9ca3af]">
      <AlertCircle size={24} />
    </div>
    <p className="text-sm text-[#9ca3af] font-medium">{message}</p>
  </div>
)

export default AdminDashboard
