import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all bookings and populate customer and driver details
    const bookings = await Booking.find()
      .populate("customerId", "name email phoneNumber")
      .populate("driverId", "name email phoneNumber vehicleType")
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Admin Bookings API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
