"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, User, LayoutDashboard, ShieldCheck, Settings, ChevronDown, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const AdminNavbar = () => {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-[40] bg-transparent" 
            onClick={() => setIsDropdownOpen(false)} 
          />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#2a2a2a] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo & Admin Badge */}
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
            
            <div className="hidden md:flex items-center gap-1 h-8 bg-red-500/10 rounded-full px-4 border border-red-500/20">
              <ShieldCheck size={14} className="text-red-500" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-tighter">Admin Control</span>
            </div>
          </div>

          {/* Center: Nav Links (Optional) */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Overview</Link>
            <Link href="/admin/partners" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Partners</Link>
            <Link href="/admin/bookings" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Bookings</Link>
            <Link href="/admin/users" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Users</Link>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-all cursor-pointer relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {session?.user?.name?.[0].toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-tight">{session?.user?.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Master Admin</p>
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
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Authorization</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="text-xs font-medium text-gray-300">Admin Mode Active</p>
                      </div>
                    </div>

                    <Link 
                      href="/admin/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer group"
                    >
                      <LayoutDashboard size={18} className="text-gray-500 group-hover:text-red-500" />
                      <span className="text-sm font-medium">Admin Dashboard</span>
                    </Link>



                    <div className="h-px bg-white/5 my-2 mx-2" />

                    <button 
                      type="button"
                      onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout Admin</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default AdminNavbar
