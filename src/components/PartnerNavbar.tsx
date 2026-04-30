"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, User, LayoutDashboard, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const PartnerNavbar = () => {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-[60] bg-transparent" 
            onClick={() => setIsDropdownOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo & Dashboard Link */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/logo.png" 
                alt="RideFlow" 
                width={120} 
                height={30} 
                className="object-contain"
              />
            </Link>
            
            <div className="hidden md:flex items-center gap-1 h-8 bg-white/5 rounded-full px-4 border border-white/10">
              <LayoutDashboard size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">Partner Portal</span>
            </div>
          </div>

          {/* Right: User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {session?.user?.name?.[0].toUpperCase() || 'P'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{session?.user?.name}</p>
                <p className="text-[10px] text-gray-500 leading-tight">Partner Account</p>
              </div>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#121212] border border-white/10 p-2 shadow-2xl z-[70] overflow-hidden"
                >
                  <div className="p-3 mb-2 bg-white/[0.02] rounded-xl">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs font-medium text-gray-300">Active Session</p>
                    </div>
                  </div>

                  <Link 
                    href="/partner/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer group"
                  >
                    <LayoutDashboard size={18} className="text-gray-500 group-hover:text-blue-500" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>

                  <Link 
                    href="/partner/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer group"
                  >
                    <User size={18} className="text-gray-500 group-hover:text-blue-500" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>



                  <div className="h-px bg-white/5 my-2 mx-2" />

                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  )
}

export default PartnerNavbar
