"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Mail,
  Phone
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'About', href: '/about' },
    { name: 'Fleet', href: '/booking' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '/privacy' },
  ]

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <Image 
                src="/logo.png" 
                alt="RideFlow Logo" 
                width={130} 
                height={35} 
                className="object-contain"
              />
            </Link>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">
              © {currentYear} RideFlow Mobility
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {quickLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Contact Icons */}
          <div className="flex items-center gap-3">
            <Link 
              href="tel:+15550001234" 
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-600/20 hover:text-green-500 transition-all border border-white/10"
              title="Call Us"
            >
              <Phone size={18} />
            </Link>
            <Link 
              href="mailto:hello@rideflow.com" 
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-600/20 hover:text-blue-500 transition-all border border-white/10"
              title="Email Us"
            >
              <Mail size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer