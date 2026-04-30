"use client"

import React from 'react'
import PartnerNavbar from '@/components/PartnerNavbar'
export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <PartnerNavbar />
      <main className="flex-grow pt-10">
        {children}
      </main>
    </div>
  )
}
