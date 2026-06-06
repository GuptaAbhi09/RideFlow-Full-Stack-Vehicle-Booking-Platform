"use client"

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  User as UserIcon,
  ChevronRight
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserData {
  _id: string
  name: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
}

const UsersListPage = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        } else {
          toast.error("Failed to load users")
        }
      } catch (error) {
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f5f5f5] flex items-center gap-3">
            <UserIcon className="text-blue-500" />
            Customer Directory
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">Manage and monitor all registered customers on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..."
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

      {/* Users List */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-[#9ca3af] border-b border-[#2a2a2a]">
          <div className="col-span-4">Customer Details</div>
          <div className="col-span-3">Contact Information</div>
          <div className="col-span-2">Account Type</div>
          <div className="col-span-2">Joined Date</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-12 items-center px-6 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-colors group"
          >
            {/* Details */}
            <div className="col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[#f5f5f5] group-hover:text-blue-400 transition-colors truncate">
                  {user.name}
                </h3>
                <p className="text-xs text-[#9ca3af] mt-0.5 font-mono truncate">{user._id}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#f5f5f5]">
                <Mail size={14} className="text-[#9ca3af]" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#f5f5f5]">
                <Phone size={14} className="text-[#9ca3af]" />
                <span>{user.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <div className="w-fit px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center gap-1.5 border border-blue-500/20">
                <Shield size={12} />
                {user.role}
              </div>
            </div>

            {/* Joined */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-xs text-[#f5f5f5]">
                <Calendar size={14} className="text-[#9ca3af]" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
              <Link 
                href={`/admin/users/${user._id}`}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg text-[#9ca3af] hover:text-[#f5f5f5] transition-colors inline-block"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-xl">
            <p className="text-[#9ca3af] text-sm font-medium">No customers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default UsersListPage
