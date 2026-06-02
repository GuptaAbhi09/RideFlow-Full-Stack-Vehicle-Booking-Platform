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

    // Create a new booking with initial state 'searching'
    const newBooking = await Booking.create({
      customerId: session.user.id, // Assuming session.user has id
      pickup,
      drop,
      mobileNumber,
      vehicleType,
      status: "searching"
    });

    return NextResponse.json({
      success: true,
      bookingId: newBooking._id,
      message: "Booking created successfully"
    });

  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
