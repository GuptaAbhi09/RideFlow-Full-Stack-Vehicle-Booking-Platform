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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserIcon className="text-blue-500" />
            Customer Directory
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all registered customers on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
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
            className="grid grid-cols-12 items-center px-6 py-4 bg-[#121212] border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all group"
          >
            {/* Details */}
            <div className="col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20 uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {user.name}
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5 font-mono truncate">{user._id}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail size={12} className="text-gray-600" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone size={12} className="text-gray-600" />
                <span>{user.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <div className="w-fit px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                <Shield size={10} />
                {user.role}
              </div>
            </div>

            {/* Joined */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={12} className="text-gray-600" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
              <Link 
                href={`/admin/users/${user._id}`}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all inline-block"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500 text-sm">No customers found matching your search.</p>
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
