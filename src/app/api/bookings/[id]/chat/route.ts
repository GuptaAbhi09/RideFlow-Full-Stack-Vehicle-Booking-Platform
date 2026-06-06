import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const { id } = await props.params;

    const booking = await Booking.findById(id).select('chatMessages customerId driverId');
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Security check: only allow customer or assigned driver
    if (
      booking.customerId.toString() !== session.user.id && 
      (!booking.driverId || booking.driverId.toString() !== session.user.id)
    ) {
      return NextResponse.json({ error: "Access denied to this chat" }, { status: 403 });
    }

    return NextResponse.json({ messages: booking.chatMessages || [] });

  } catch (error) {
    console.error("Fetch chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    await connectDb();
    const { id } = await props.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Determine sender role based on who is logged in
    let senderRole: 'customer' | 'partner';
    if (booking.customerId.toString() === session.user.id) {
      senderRole = 'customer';
    } else if (booking.driverId && booking.driverId.toString() === session.user.id) {
      senderRole = 'partner';
    } else {
      return NextResponse.json({ error: "Access denied to this chat" }, { status: 403 });
    }

    const newMessage = {
      sender: senderRole,
      text: text.trim(),
      timestamp: new Date()
    };

    booking.chatMessages.push(newMessage);
    await booking.save();

    return NextResponse.json({ success: true, message: newMessage });

  } catch (error) {
    console.error("Save chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
