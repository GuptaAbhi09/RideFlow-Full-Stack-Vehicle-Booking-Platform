import React from 'react'
import connectDb from '@/lib/db'
import Booking from '@/models/booking.model'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrackingDashboard from '@/components/TrackingDashboard'

// Dummy tracking page for Phase 1
export default async function TrackingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  await connectDb()
  const booking = await Booking.findById(params.id)
  
  if (!booking) {
    notFound()
  }

  // Serialize the booking for client component
  const bookingData = {
    id: booking._id.toString(),
    status: booking.status,
    pickup: booking.pickup,
    drop: booking.drop,
    vehicleType: booking.vehicleType
  }

  return (
    <>
      <Navbar />
      <TrackingDashboard booking={bookingData} />
    </>
  )
}
