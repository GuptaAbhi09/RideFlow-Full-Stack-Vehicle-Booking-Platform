import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Booking from '@/models/booking.model';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = await params;
    await connectDb();
    
    // We populate driverId to get their name and phone number (or vehicle info)
    const booking = await Booking.findOne({ trackingToken: token })
      .populate('driverId', 'name phoneNumber')
      .select('pickup drop pickupLat pickupLng dropLat dropLng status vehicleType trackingToken driverId');

    if (!booking) {
      return NextResponse.json({ error: "Tracking link invalid or expired" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Public Tracking API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
