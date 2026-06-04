import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking, { bookingStatusEnum } from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized. Only partners can update status." }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !bookingStatusEnum.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    booking.status = status;
    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
