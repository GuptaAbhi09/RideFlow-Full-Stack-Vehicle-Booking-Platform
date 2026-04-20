"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Bus, Bike, Car, Truck, ChevronRight } from 'lucide-react'

const HeroSection = () => {
  const vehicleIcons = [
    { Icon: Bus, label: 'Bus' },
    { Icon: Bike, label: 'Bike' },
    { Icon: Truck, label: 'Truck' },
    { Icon: Car, label: 'Car' },
  ]

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-[#0a0a0a] pt-20">
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{ 
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) blur(4px)'
        }} 
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a] z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex justify-center"
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-md">
            The Future of Urban Mobility
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight"
        >
          Your Journey, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Perfected.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Experience seamless vehicle booking with real-time tracking, secure payments, and a fleet tailored for every need.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center gap-2 overflow-hidden">
            <span className="relative z-10">Book Now</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {vehicleIcons.map(({ Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 backdrop-blur-sm shadow-xl transition-colors"
            >
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                <Icon size={24} />
              </div>
              <span className="text-white font-semibold">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1 h-12 rounded-full bg-gradient-to-b from-blue-500 to-transparent opacity-50"
        />
      </div>
    </section>
  )
}

export default HeroSection