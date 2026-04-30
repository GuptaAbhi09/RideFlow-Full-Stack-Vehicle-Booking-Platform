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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-red-500" />
            Partners Directory
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all registered partners on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
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
            className="grid grid-cols-12 items-center px-6 py-4 bg-[#121212] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all group"
          >
            {/* Details */}
            <div className="col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-600/20">
                {partner.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {partner.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                  <Calendar size={10} />
                  Joined {new Date(partner.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail size={12} className="text-gray-600" />
                <span className="truncate">{partner.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone size={12} className="text-gray-600" />
                <span>{partner.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Step */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                  <div 
                    className="h-full bg-red-500" 
                    style={{ width: `${(partner.partnerOnboardingStep / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">Step {partner.partnerOnboardingStep}/4</span>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <div className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                partner.partnerStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                partner.partnerStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {partner.partnerStatus === 'approved' ? <CheckCircle2 size={10} /> :
                 partner.partnerStatus === 'pending' ? <Clock size={10} /> :
                 <XCircle size={10} />}
                {partner.partnerStatus}
              </div>
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
              <Link 
                href={`/admin/partners/${partner._id}`}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all inline-block"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500 text-sm">No partners found matching your search.</p>
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
