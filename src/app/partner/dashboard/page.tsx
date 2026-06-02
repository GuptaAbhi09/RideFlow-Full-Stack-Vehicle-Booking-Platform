"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Car, 
  FileText, 
  CreditCard, 
  Search, 
  Video, 
  DollarSign, 
  ClipboardCheck, 
  Zap,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import DriverRidesList from '@/components/DriverRidesList'

const steps = [
  { id: 1, title: 'Vehicle Details', icon: Car, route: '/partner/onboarding/vehicle', description: 'Basic info about your ride' },
  { id: 2, title: 'Documents', icon: FileText, route: '/partner/onboarding/documents', description: 'Aadhar, License, and RC upload' },
  { id: 3, title: 'Bank Account', icon: CreditCard, route: '/partner/onboarding/bank', description: 'Where you receive your earnings' },
  { id: 4, title: 'Admin Review', icon: Search, route: null, description: 'We are verifying your documents' },
  { id: 5, title: 'Video KYC', icon: Video, route: '/partner/onboarding/kyc', description: 'Quick 1-on-1 verification call' },
  { id: 6, title: 'Fare Pricing', icon: DollarSign, route: '/partner/onboarding/pricing', description: 'Set your base and per-km rates' },
  { id: 7, title: 'Final Approval', icon: ClipboardCheck, route: null, description: 'Final check before going live' },
  { id: 8, title: 'Live', icon: Zap, route: null, description: 'Your profile is active and ready!' },
]

export default function PartnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, vehicleRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/partner/onboarding/vehicle')
        ])
        
        if (userRes.ok) {
          const userData = await userRes.json()
          setUserData(userData)
        }
        
        if (vehicleRes.ok) {
          const vehicleData = await vehicleRes.json()
          setVehicleData(vehicleData.vehicle)
        }
      } catch (error) {
        console.error("Dashboard error:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentStep = userData?.partnerOnboardingStep || 0
  const partnerStatus = userData?.partnerStatus || 'none'
  const vehicleStatus = vehicleData?.status || 'none'

  // Helper to determine step status
  const getStepStatus = (stepId: number) => {
    // If vehicle is rejected, allow access to step 1 and step 6 to fix
    if (vehicleStatus === 'rejected' && (stepId === 1 || stepId === 6)) {
        return 'in-progress'
    }

    if (stepId <= currentStep) {
        // Special case for Review step (Step 4)
        if (stepId === 4 && partnerStatus !== 'approved') return 'in-progress'
        return 'completed'
    }
    
    // Logic for unlocking next steps
    if (stepId === currentStep + 1) {
        if (currentStep === 3 && partnerStatus !== 'approved' && stepId > 3) return 'locked'
        return 'in-progress'
    }
    
    return 'locked'
  }

  return (
    <div className="pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Partner Dashboard</h1>
          </div>
        </div>

        {/* Vehicle Rejection Banner */}
        {vehicleStatus === 'rejected' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
          >
            <div className="bg-red-500/20 p-2 rounded-xl shrink-0 mt-1">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-500 text-lg mb-1">Final Vehicle Verification Failed</h4>
              <p className="text-sm text-red-400/80 mb-3 leading-relaxed">
                Your vehicle application was reviewed but could not be approved. Reason: <strong className="text-red-400">"{vehicleData.rejectionReason}"</strong>
              </p>
              <button 
                onClick={() => router.push('/partner/onboarding/pricing')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 w-fit"
              >
                Fix Fare Pricing & Vehicle Photo
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Status Banner */}
        {partnerStatus === 'pending' && currentStep === 3 && vehicleStatus !== 'rejected' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4"
          >
            <div className="bg-yellow-500/20 p-2 rounded-xl">
              <Clock className="text-yellow-500" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-yellow-500">Review in Progress</h4>
              <p className="text-sm text-yellow-500/70">Our team is verifying your documents. This usually takes 24-48 hours.</p>
            </div>
          </motion.div>
        )}

        {/* Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const status = getStepStatus(step.id)
            const isCompleted = status === 'completed'
            const isInProgress = status === 'in-progress'
            const isLocked = status === 'locked'

            return (
              <motion.div
                key={step.id}
                whileHover={!isLocked ? { scale: 1.02, backgroundColor: '#1a1a1a' } : {}}
                onClick={() => {
                    if (!isLocked && step.route) {
                        router.push(step.route)
                    } else if (status === 'in-progress' && !step.route) {
                        toast.error("Waiting for admin action...")
                    }
                }}
                className={`relative p-6 rounded-3xl border transition-all cursor-pointer overflow-hidden group
                  ${isCompleted ? 'bg-green-500/5 border-green-500/20' : 
                    isInProgress ? 'bg-blue-600/5 border-blue-500/40 shadow-lg shadow-blue-600/5' : 
                    'bg-white/[0.02] border-white/5 opacity-60'}`}
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity
                  ${isCompleted ? 'text-green-500' : isInProgress ? 'text-blue-500' : 'text-white'}`}>
                  <step.icon size={100} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${
                      isCompleted ? 'bg-green-500/20 text-green-500' : 
                      isInProgress ? 'bg-blue-600 text-white' : 
                      'bg-white/5 text-gray-500'
                    }`}>
                      <step.icon size={22} />
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : isLocked ? (
                      <Lock size={18} className="text-gray-600" />
                    ) : (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                        Next
                      </div>
                    )}
                  </div>

                  <h3 className={`font-bold mb-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                    {step.id}. {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  
                  {!isLocked && (
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-blue-400 group-hover:gap-2 transition-all">
                      {isCompleted ? 'View Details' : 'Continue'} <ChevronRight size={12} />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {partnerStatus === 'approved' && (
          <DriverRidesList />
        )}

      </div>
    </div>
  )
}
