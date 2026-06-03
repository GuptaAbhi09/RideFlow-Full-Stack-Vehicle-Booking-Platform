import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== "partner") {
      return NextResponse.json({ activeBooking: null }, { status: 200 }); // Not authorized, silently fail
    }

    await connectDb();

    // Find a booking that the driver has accepted but not yet completed
    const activeBooking = await Booking.findOne({
      driverId: session.user.id,
      status: { $in: ["accepted", "arriving", "started"] }
    }).sort({ createdAt: -1 });

    if (activeBooking) {
      return NextResponse.json({ 
        activeBooking: {
          id: activeBooking._id,
          status: activeBooking.status,
          pickup: activeBooking.pickup,
          drop: activeBooking.drop
        }
      });
    }

    return NextResponse.json({ activeBooking: null });

  } catch (error: any) {
    console.error("Active Driver Booking Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
