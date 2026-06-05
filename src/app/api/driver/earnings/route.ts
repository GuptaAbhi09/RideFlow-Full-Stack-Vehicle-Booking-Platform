import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'partner') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    // 1. Fetch User to get withdrawnAmount
    const user = await User.findById(session.user.id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch all completed bookings for this driver
    const bookings = await Booking.find({ 
        driverId: session.user.id, 
        status: 'completed' 
    }).sort({ createdAt: -1 });

    // 3. Mathematical Aggregation
    let totalRevenue = 0;
    let todayRevenue = 0;
    
    // Get start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    bookings.forEach(booking => {
        const fare = booking.fare || 0;
        totalRevenue += fare;

        const bookingDate = new Date(booking.createdAt);
        if (bookingDate >= startOfToday) {
            todayRevenue += fare;
        }
    });

    // Apply 90/10 split
    const lifetimeNetEarnings = totalRevenue * 0.9;
    const todayNetEarnings = todayRevenue * 0.9;
    const withdrawnAmount = user.withdrawnAmount || 0;
    const availableBalance = Math.max(0, lifetimeNetEarnings - withdrawnAmount);

    return NextResponse.json({ 
        success: true, 
        data: {
            totalRevenue,
            lifetimeNetEarnings,
            todayNetEarnings,
            withdrawnAmount,
            availableBalance,
            totalTrips: bookings.length,
            recentRides: bookings.slice(0, 5) // Return only the 5 most recent for the table
        } 
    });
  } catch (error: any) {
    console.error("Fetch Earnings Error:", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
