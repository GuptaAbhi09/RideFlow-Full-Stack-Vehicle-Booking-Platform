import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized. Only partners can accept rides." }, { status: 401 });
    }

    await connectDb();

    // Ensure the booking exists and is still looking for a driver
    const booking = await Booking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "searching") {
      return NextResponse.json({ error: "This ride is no longer available." }, { status: 400 });
    }

    // Assign the driver and update status
    booking.driverId = session.user.id;
    booking.status = "accepted";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Ride accepted successfully!",
      booking
    });

  } catch (error: any) {
    console.error("Accept Ride Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
