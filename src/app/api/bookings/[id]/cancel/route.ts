import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    const booking = await Booking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Security check: Only the customer who booked it, or the driver assigned to it, can cancel it.
    const isCustomer = booking.customerId.toString() === session.user.id;
    const isDriver = booking.driverId && booking.driverId.toString() === session.user.id;
    
    // Also allow customer to cancel if no driver is assigned yet (status: 'searching')
    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "You are not authorized to cancel this ride." }, { status: 403 });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json({ error: "This ride cannot be cancelled." }, { status: 400 });
    }

    // Mark as cancelled
    booking.status = "cancelled";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Ride cancelled successfully!",
      booking
    });

  } catch (error: any) {
    console.error("Cancel Ride Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
