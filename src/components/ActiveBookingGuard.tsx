"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ActiveBookingGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkActiveBooking = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/bookings/active')
          const data = await res.json()
          
          if (data.activeBooking && isMounted) {
            // User has an ongoing booking, redirect to tracking page
            router.push(`/booking/${data.activeBooking.id}/tracking`)
          } else {
            if (isMounted) setChecking(false)
          }
        } catch (error) {
          console.error("Failed to check active booking:", error)
          if (isMounted) setChecking(false)
        }
      } else if (status === 'unauthenticated') {
        if (isMounted) setChecking(false)
      }
    }

    checkActiveBooking()

    return () => {
      isMounted = false
    }
  }, [status, router])

  if (checking) {
    // Show a full screen loader while checking to prevent layout flash
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    )
  }

  return <>{children}</>
}
