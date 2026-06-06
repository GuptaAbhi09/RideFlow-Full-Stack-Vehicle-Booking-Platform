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
    <section className="pt-16 pb-24 bg-[#0f0f0f] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#9ca3af] font-medium mb-3 text-sm">
              <Zap size={16} />
              <span>Available Fleet</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#f5f5f5]">
              Choose Your Perfect Ride
            </h2>
          </div>
          <p className="text-[#9ca3af] max-w-md">
            From quick city hops to heavy logistics, we have a fleet tailored for every possible need and budget.
          </p>
        </div>

        <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[280px] md:min-w-[320px] snap-center"
            >
              <div className="h-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[#9ca3af]">
                    <vehicle.icon size={28} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">{vehicle.name}</h3>
                <p className="text-[#9ca3af] text-sm mb-6 line-clamp-2">
                  {vehicle.description}
                </p>

                <div className="space-y-3">
                  {vehicle.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-[#f5f5f5] text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fleet Info Footer */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
          <div className="flex items-center gap-4">
            <div className="text-[#9ca3af]">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-[#f5f5f5] font-semibold">Safety First</h4>
              <p className="text-[#9ca3af] text-sm">Every ride is GPS tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x border-[#2a2a2a] py-6 md:py-0 md:px-8">
            <div className="text-[#9ca3af]">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-[#f5f5f5] font-semibold">24/7 Service</h4>
              <p className="text-[#9ca3af] text-sm">Booking available anytime</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[#9ca3af]">
              <Star size={24} />
            </div>
            <div>
              <h4 className="text-[#f5f5f5] font-semibold">Top Rated</h4>
              <p className="text-[#9ca3af] text-sm">Verified professional drivers</p>
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