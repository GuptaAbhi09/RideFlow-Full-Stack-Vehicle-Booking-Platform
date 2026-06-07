import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please login to book a ride." }, { status: 401 });
    }

    const body = await req.json();
    const { pickup, drop, mobileNumber, vehicleType, fare, distance, duration, pickupLat, pickupLng, dropLat, dropLng } = body;

    if (!pickup || !drop || !mobileNumber || !vehicleType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDb();

    // Coordinates are now provided by the estimate step
    const pLat = pickupLat ? parseFloat(pickupLat) : undefined;
    const pLng = pickupLng ? parseFloat(pickupLng) : undefined;
    const dLat = dropLat ? parseFloat(dropLat) : undefined;
    const dLng = dropLng ? parseFloat(dropLng) : undefined;

    // Safety check: Does the user already have an active booking?
    const existingBooking = await Booking.findOne({
      customerId: session.user.id,
      status: { $in: ["searching", "accepted"] }
    });

    if (existingBooking) {
      return NextResponse.json({ 
        error: "You already have an active ride request.",
        activeBookingId: existingBooking._id 
      }, { status: 409 });
    }

    // Generate a random 4-digit OTP (1000 - 9999)
    const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Generate a unique tracking token for live sharing
    const trackingToken = crypto.randomUUID();

    // Create a new booking with initial state 'searching'
    const newBooking = await Booking.create({
      customerId: session.user.id, // Assuming session.user has id
      pickup,
      pickupLat: pLat,
      pickupLng: pLng,
      drop,
      dropLat: dLat,
      dropLng: dLng,
      mobileNumber,
      vehicleType,
      fare,
      distance,
      duration,
      startOtp,
      trackingToken,
      status: "searching"
    });

    return NextResponse.json({
      success: true,
      bookingId: newBooking._id,
      pickupLat: newBooking.pickupLat,
      pickupLng: newBooking.pickupLng,
      vehicleType: newBooking.vehicleType,
      message: "Booking created successfully"
    });

  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
