import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
    }

    // Creating the HMAC SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    // Comparing the signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful and verified
      await connectDb();
      
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Update booking status
      booking.paymentStatus = 'completed';
      booking.paymentId = razorpay_payment_id;
      await booking.save();

      return NextResponse.json({ 
        success: true, 
        message: "Payment verified successfully",
        booking
      });
      
    } else {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
