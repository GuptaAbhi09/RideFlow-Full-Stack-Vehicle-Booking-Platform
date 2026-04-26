"use client"

import React from 'react'
import { motion } from 'motion/react'
import { 
  CarTaxiFront, 
  Bike, 
  Car, 
  Bus, 
  Truck, 
  Zap, 
  Shield, 
  Clock,
  ChevronRight,
  Star
} from 'lucide-react'

const vehicles = [
  {
    id: 'bike',
    name: 'Swift Bike',
    icon: Bike,
    description: 'Perfect for quick city hops and avoiding traffic.',
    price: '₹5/km',
    rating: 4.8,
    features: ['Eco-friendly', 'Quick Parking', 'No Traffic'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'taxi',
    name: 'Economy Taxi',
    icon: CarTaxiFront,
    description: 'Comfortable hatchbacks for your daily city commute.',
    price: '₹12/km',
    rating: 4.9,
    features: ['Air Conditioned', 'Clean Seats', 'Music System'],
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'premium',
    name: 'Premium Sedan',
    icon: Car,
    description: 'Luxury sedans for business meetings and special events.',
    price: '₹18/km',
    rating: 5.0,
    features: ['Extra Legroom', 'WIFI Access', 'Professional Driver'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'suv',
    name: 'Luxury SUV',
    icon: Car,
    description: 'Spacious 7-seaters for family trips and adventures.',
    price: '₹22/km',
    rating: 4.9,
    features: ['Spacious Boot', 'Sunroof', 'All-Terrain'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'bus',
    name: 'Coach Bus',
    icon: Bus,
    description: 'Large group travel solutions for tours and events.',
    price: '₹45/km',
    rating: 4.7,
    features: ['Reclining Seats', 'Entertainment', 'Large Group'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'truck',
    name: 'Cargo Truck',
    icon: Truck,
    description: 'Reliable transport for moving goods and heavy logistics.',
    price: '₹60/km',
    rating: 4.6,
    features: ['Safe Handling', 'GPS Tracking', 'Heavy Load'],
    color: 'from-gray-600 to-slate-800'
  }
]

const VehicleSlider = () => {
  return (
    <section className="pt-16 pb-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-blue-500 font-bold mb-3 uppercase tracking-widest text-sm"
            >
              <Zap size={16} />
              <span>Available Fleet</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-white"
            >
              Choose Your <span className="text-blue-600">Perfect Ride</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-md"
          >
            From quick city hops to heavy logistics, we have a fleet tailored for every possible need and budget.
          </motion.p>
        </div>

        <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[280px] md:min-w-[320px] snap-center"
            >
              <div className="group relative h-full rounded-3xl bg-white/5 border border-white/10 p-8 transition-all duration-500 hover:bg-white/[0.08] hover:border-blue-500/30">
                {/* Glow Effect */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${vehicle.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vehicle.color} flex items-center justify-center text-white shadow-lg`}>
                    <vehicle.icon size={28} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{vehicle.name}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                  {vehicle.description}
                </p>

                <div className="space-y-3">
                  {vehicle.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fleet Info Footer */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-blue-600/5 border border-blue-600/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">Safety First</h4>
              <p className="text-gray-400 text-sm">Every ride is GPS tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x border-white/5 py-6 md:py-0 md:px-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">24/7 Service</h4>
              <p className="text-gray-400 text-sm">Booking available anytime</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <Star size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">Top Rated</h4>
              <p className="text-gray-400 text-sm">Verified professional drivers</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

export default VehicleSlider