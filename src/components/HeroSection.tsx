"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Bus, Bike, Car, Truck, ChevronRight } from 'lucide-react'

const HeroSection = ({ onBookNow }: { onBookNow: () => void }) => {
  const vehicleIcons = [
    { Icon: Bus, label: 'Bus' },
    { Icon: Bike, label: 'Bike' },
    { Icon: Truck, label: 'Truck' },
    { Icon: Car, label: 'Car' },
  ]

  return (
    <section className="relative min-h-[90vh] py-24 w-full overflow-hidden flex items-center justify-center bg-[#0f0f0f] pt-32 pb-20">
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{ 
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) blur(4px)',
          opacity: 0.4
        }} 
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/50 to-[#0f0f0f] z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1 text-xs font-medium text-[#9ca3af]">
            The Future of Urban Mobility
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-semibold text-[#f5f5f5] leading-snug mb-6"
        >
          Your Journey, Perfected.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-base md:text-lg text-[#9ca3af] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Experience seamless vehicle booking with real-time tracking, secure payments, and a fleet tailored for every need.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <button 
            onClick={onBookNow}
            className="bg-blue-600 text-white rounded-lg px-5 py-2.5 transition-opacity hover:opacity-90 flex items-center gap-2 font-medium"
          >
            <span>Book Now</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-x-12 gap-y-6 max-w-4xl mx-auto"
        >
          {vehicleIcons.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="text-[#9ca3af] group-hover:text-blue-600 transition-colors duration-200">
                <Icon size={32} />
              </div>
              <span className="text-[#9ca3af] text-sm font-medium group-hover:text-[#f5f5f5] transition-colors duration-200">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection