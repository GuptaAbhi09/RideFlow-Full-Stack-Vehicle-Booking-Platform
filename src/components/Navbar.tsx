"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { signOut, useSession } from 'next-auth/react'
import { Menu, X, User as UserIcon, LogOut, Briefcase } from 'lucide-react'

const Navbar = ({ onLogin }: { onLogin: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user: reduxUser } = useSelector((state: RootState) => state.user)
  const { data: session, status } = useSession()
  const currentUser = reduxUser || session?.user
  const isAuthLoading = status === 'loading'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Booking', href: '/booking' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 border-b ${
        scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-lg border-white/10' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center">
        {/* Left: Logo - Fixed width to balance the layout */}
        <div className="w-[200px] flex-shrink-0">
          <Link href="/" className="flex items-center group cursor-pointer w-fit">
            <Image 
              src="/logo.png"
              alt="RideFlow Logo" 
              width={150} 
              height={40} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Middle: Links - Centered space */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-gray-300 hover:text-white font-medium transition-colors relative group cursor-pointer whitespace-nowrap"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right: Auth/Profile - Fixed width to prevent shifting links */}
        <div className="hidden md:flex w-[200px] flex-shrink-0 justify-end items-center gap-4">
          {isAuthLoading ? (
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          ) : currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-blue-700 transition-all border-2 border-white/10 shadow-lg"
              >
                {currentUser.name?.[0].toUpperCase()}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[-1]" 
                      onClick={() => setIsProfileOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-4 w-64 rounded-2xl bg-[#121212] border border-white/10 p-4 shadow-2xl z-50"
                    >
                      <div className="pb-4 border-b border-white/5 mb-4 px-2">
                        <p className="text-white font-bold text-lg truncate">{currentUser.name}</p>
                        <p className="text-gray-400 text-xs truncate">{currentUser.email}</p>
                      </div>

                      <div className="space-y-1">
                        <Link 
                          href={currentUser.role === 'partner' ? '/partner/dashboard' : '/partner/onboarding/vehicle'} 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                        >
                          <Briefcase size={18} className="text-blue-500" />
                          <span className="font-medium">
                            {currentUser.role === 'partner' ? 'Partner Dashboard' : 'Become a Partner'}
                          </span>
                        </Link>
                        
                        <button 
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2 cursor-pointer ml-auto"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white text-lg font-medium cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthLoading ? (
              <div className="mt-4 pt-6 border-t border-white/10 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-white/5 animate-pulse" />
              </div>
            ) : currentUser ? (
              <div className="mt-4 pt-6 border-t border-white/10 space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {currentUser.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{currentUser.name}</p>
                    <p className="text-gray-400 text-sm">{currentUser.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link 
                    href={currentUser.role === 'partner' ? '/partner/dashboard' : '/partner/onboarding/vehicle'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-blue-400 w-full"
                  >
                    <Briefcase size={20} />
                    <span className="text-sm font-bold">
                      {currentUser.role === 'partner' ? 'Partner Dashboard' : 'Become a Partner'}
                    </span>
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 w-full cursor-pointer"
                  >
                    <LogOut size={20} />
                    <span className="text-sm font-bold">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  onLogin();
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-white text-black font-bold rounded-xl mt-2 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar