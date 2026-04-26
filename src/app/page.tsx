"use client"

import React, { useState } from 'react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PublicHome from '@/components/PublicHome'

const Page = () => {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <Navbar onLogin={() => setAuthOpen(true)} />
      <PublicHome onAuthOpen={() => setAuthOpen(true)} authOpen={authOpen} setAuthOpen={setAuthOpen} />
      <Footer />
    </>
  )
}

export default Page