import React from 'react'
import connectDb from '@/lib/db'
import Booking from '@/models/booking.model'
import { notFound } from 'next/navigation'
import DriverActiveTrip from '@/components/DriverActiveTrip'

export default async function DriverActiveTripPage(props: { params: Promise<{ id: string }> }) {
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
    vehicleType: booking.vehicleType,
    pickupLat: booking.pickupLat,
    pickupLng: booking.pickupLng,
    dropLat: booking.dropLat,
    dropLng: booking.dropLng,
    startOtp: booking.startOtp
  }

  return (
    <>
      <DriverActiveTrip booking={bookingData} />
    </>
  )
}
