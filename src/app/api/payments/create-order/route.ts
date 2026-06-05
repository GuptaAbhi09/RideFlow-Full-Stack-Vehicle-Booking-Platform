import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ensure only the customer can initiate payment
    if (booking.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "You are not authorized to pay for this booking" }, { status: 403 });
    }

    if (!booking.fare) {
      return NextResponse.json({ error: "Fare is not calculated for this booking" }, { status: 400 });
    }

    // Razorpay amount is in paise (fare * 100)
    const amount = booking.fare * 100;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
