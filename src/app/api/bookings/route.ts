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
    const { pickup, drop, mobileNumber, vehicleType } = body;

    if (!pickup || !drop || !mobileNumber || !vehicleType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDb();

    // Geocode the pickup location to get precise Lat/Lng
    let pickupLat = 0;
    let pickupLng = 0;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}&limit=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        pickupLat = parseFloat(geoData[0].lat);
        pickupLng = parseFloat(geoData[0].lon);
      }
    } catch (err) {
      console.error("Failed to geocode pickup location:", err);
      // We will still create the booking, but without strict geospatial dispatch
    }

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

    // Create a new booking with initial state 'searching'
    const newBooking = await Booking.create({
      customerId: session.user.id, // Assuming session.user has id
      pickup,
      pickupLat: pickupLat || undefined,
      pickupLng: pickupLng || undefined,
      drop,
      mobileNumber,
      vehicleType,
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
