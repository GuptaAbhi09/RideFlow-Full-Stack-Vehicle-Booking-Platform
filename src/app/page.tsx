"use client"

import React, { useState } from 'react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PublicHome from '@/components/PublicHome'
import ActiveBookingGuard from '@/components/ActiveBookingGuard'

const Page = () => {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <ActiveBookingGuard>
      <Navbar onLogin={() => setAuthOpen(true)} />
      <PublicHome onAuthOpen={() => setAuthOpen(true)} authOpen={authOpen} setAuthOpen={setAuthOpen} />
      <Footer />
    </ActiveBookingGuard>
  )
}

export default Page