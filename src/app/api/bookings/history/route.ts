import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    let query: any = { status: { $in: ['completed', 'cancelled'] } };

    // Customers see rides they requested. Partners see rides they drove.
    if (session.user.role === 'partner') {
      query.driverId = session.user.id;
    } else {
      query.customerId = session.user.id;
    }

    // Populate the other party's details so the UI can display them
    const bookings = await Booking.find(query)
      .populate(session.user.role === 'partner' ? 'customerId' : 'driverId', 'name email phoneNumber')
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ error: "Failed to fetch ride history" }, { status: 500 });
  }
}
