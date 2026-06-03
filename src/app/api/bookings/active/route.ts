import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ activeBooking: null }, { status: 200 }); // Not logged in
    }

    await connectDb();

    // Check if the user has a booking that is currently ongoing
    const activeBooking = await Booking.findOne({
      customerId: session.user.id,
      status: { $in: ["searching", "accepted"] }
    }).sort({ createdAt: -1 }); // Get the most recent one just in case

    if (activeBooking) {
      return NextResponse.json({ 
        activeBooking: {
          id: activeBooking._id,
          status: activeBooking.status
        }
      });
    }

    return NextResponse.json({ activeBooking: null });

  } catch (error: any) {
    console.error("Active Booking Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
