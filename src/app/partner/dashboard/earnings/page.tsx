"use client"

import React, { useEffect, useState } from 'react'
import { Wallet, IndianRupee, TrendingUp, Car, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/driver/earnings')
      const data = await res.json()
      if (data.success) {
        setEarnings(data.data)
      }
    } catch (e) {
      toast.error("Failed to load earnings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!earnings || earnings.availableBalance <= 0) {
        toast.error("No funds available to withdraw")
        return;
    }

    setIsWithdrawing(true)

    try {
        const res = await fetch('/api/driver/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: earnings.availableBalance })
        })

        const data = await res.json()

        if (data.success) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
            toast.success(data.message, { duration: 5000 })
            // Refresh data to show 0 balance
            fetchEarnings()
        } else {
            toast.error(data.error || "Withdrawal failed")
        }
    } catch (error) {
        toast.error("Network error during withdrawal")
    } finally {
        setIsWithdrawing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex justify-center pt-32">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 pt-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-[#f5f5f5] mb-8">Earnings & Payouts</h1>

        {/* Big Available Balance Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Wallet size={150} />
          </div>
          <div className="relative z-10">
            <p className="text-[#9ca3af] font-medium text-sm mb-2">Available for Withdrawal</p>
            <h2 className="text-5xl font-semibold text-[#f5f5f5] mb-6">₹{earnings?.availableBalance.toFixed(2)}</h2>
            
            <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || earnings?.availableBalance <= 0}
                className="px-6 py-3 bg-blue-600 hover:opacity-90 text-white disabled:opacity-50 rounded-lg font-medium transition-opacity flex items-center gap-2"
            >
                {isWithdrawing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Withdraw to Bank
                        <ArrowUpRight size={20} />
                    </>
                )}
            </button>
            <p className="text-xs text-[#9ca3af] mt-4">Processing via IMPS. Funds arrive instantly.</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-xl">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <p className="text-[#9ca3af] text-sm font-medium mb-1">Today's Earnings</p>
                <h3 className="text-2xl font-semibold text-[#f5f5f5]">₹{earnings?.todayNetEarnings.toFixed(2)}</h3>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-xl">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <IndianRupee className="text-purple-500" size={20} />
                </div>
                <p className="text-[#9ca3af] text-sm font-medium mb-1">Lifetime Net Earnings</p>
                <h3 className="text-2xl font-semibold text-[#f5f5f5]">₹{earnings?.lifetimeNetEarnings.toFixed(2)}</h3>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-xl">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Car className="text-orange-500" size={20} />
                </div>
                <p className="text-[#9ca3af] text-sm font-medium mb-1">Total Trips Completed</p>
                <h3 className="text-2xl font-semibold text-[#f5f5f5]">{earnings?.totalTrips}</h3>
            </div>
        </div>

        {/* Recent Transactions Table */}
        <div>
            <h3 className="text-xl font-semibold text-[#f5f5f5] mb-6">Recent Ride Payouts (90% Cut)</h3>
            {earnings?.recentRides.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
                    <p className="text-[#9ca3af]">You haven't completed any rides yet.</p>
                </div>
            ) : (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f0f0f] border-b border-[#2a2a2a]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-medium text-[#9ca3af]">Date</th>
                                    <th className="px-6 py-4 text-xs font-medium text-[#9ca3af]">Route</th>
                                    <th className="px-6 py-4 text-xs font-medium text-[#9ca3af]">Total Fare</th>
                                    <th className="px-6 py-4 text-xs font-medium text-emerald-500">Your Earnings (90%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]">
                                {earnings?.recentRides.map((ride: any) => (
                                    <tr key={ride._id} className="hover:bg-[#2a2a2a]/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[#f5f5f5]">{format(new Date(ride.createdAt), 'MMM dd, yyyy')}</div>
                                            <div className="text-xs text-[#9ca3af]">{format(new Date(ride.createdAt), 'h:mm a')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[#f5f5f5] max-w-[200px] truncate">{ride.pickup}</div>
                                            <div className="text-xs text-[#9ca3af] mt-1">To: {ride.drop}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9ca3af]">
                                            ₹{ride.fare.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="text-emerald-500" size={16} />
                                                <span className="text-sm font-medium text-emerald-500">₹{(ride.fare * 0.9).toFixed(2)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        
      </div>
    </div>
  )
}
