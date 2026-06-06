"use client"

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Partner {
  _id: string
  name: string
  email: string
  phoneNumber: string
  partnerStatus: 'pending' | 'approved' | 'rejected'
  partnerOnboardingStep: number
  createdAt: string
}

const PartnersListPage = () => {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch('/api/admin/partners')
        if (res.ok) {
          const data = await res.json()
          setPartners(data)
        } else {
          toast.error("Failed to load partners")
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [])

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f5f5f5] flex items-center gap-3">
            <Users className="text-blue-500" />
            Partners Directory
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">Manage and monitor all registered partners on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-2.5 pl-12 pr-4 text-[#f5f5f5] text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-[#9ca3af]"
            />
          </div>
          <button className="p-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#9ca3af] hover:text-[#f5f5f5] transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-[#9ca3af] border-b border-[#2a2a2a]">
          <div className="col-span-4">Partner Details</div>
          <div className="col-span-3">Contact Info</div>
          <div className="col-span-2">Onboarding</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filteredPartners.length > 0 ? filteredPartners.map((partner, idx) => (
          <motion.div
            key={partner._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-12 items-center px-6 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-colors group"
          >
            {/* Details */}
            <div className="col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {partner.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[#f5f5f5] group-hover:text-blue-400 transition-colors truncate">
                  {partner.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#9ca3af] mt-0.5">
                  <Calendar size={12} />
                  Joined {new Date(partner.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#f5f5f5]">
                <Mail size={14} className="text-[#9ca3af]" />
                <span className="truncate">{partner.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#f5f5f5]">
                <Phone size={14} className="text-[#9ca3af]" />
                <span>{partner.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Step */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#0f0f0f] rounded-full overflow-hidden max-w-[60px] border border-[#2a2a2a]">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(partner.partnerOnboardingStep / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#9ca3af]">Step {partner.partnerOnboardingStep}/4</span>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <div className={`w-fit px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                partner.partnerStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                partner.partnerStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {partner.partnerStatus === 'approved' ? <CheckCircle2 size={12} /> :
                 partner.partnerStatus === 'pending' ? <Clock size={12} /> :
                 <XCircle size={12} />}
                {partner.partnerStatus}
              </div>
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
              <Link 
                href={`/admin/partners/${partner._id}`}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg text-[#9ca3af] hover:text-[#f5f5f5] transition-colors inline-block"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-xl">
            <p className="text-[#9ca3af] text-sm font-medium">No partners found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default PartnersListPage
