import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized. Only partners can view available rides." }, { status: 401 });
    }

    await connectDb();

    // Find all rides that are currently looking for a driver
    // We sort by newest first
    const rides = await Booking.find({ status: "searching" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      rides
    });

  } catch (error: any) {
    console.error("Fetch Available Rides Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
