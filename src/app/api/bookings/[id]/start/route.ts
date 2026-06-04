import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized. Only partners can start trips." }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();
    const { otp } = body;

    if (!otp) {
      return NextResponse.json({ error: "OTP is required to start the trip." }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this partner is assigned to this booking
    if (booking.driverId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this booking." }, { status: 403 });
    }

    // Validate the OTP
    if (booking.startOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP. Please ask the customer for the correct 4-digit PIN." }, { status: 400 });
    }

    // Success! Start the trip.
    booking.status = "started";
    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Trip Start Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
