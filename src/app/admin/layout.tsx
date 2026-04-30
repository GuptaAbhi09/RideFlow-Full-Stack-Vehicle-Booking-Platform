"use client"

import React from 'react'
import AdminNavbar from '@/components/AdminNavbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <AdminNavbar />
      <main className="flex-grow pt-[90px]">
        {children}
      </main>
    </div>
  )
}
