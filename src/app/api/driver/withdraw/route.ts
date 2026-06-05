import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'partner') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
    }

    await connectDb();

    // In a real application with RazorpayX or Stripe Connect, we would:
    // 1. Verify the driver has the requested amount available.
    // 2. Make an API call to the payment gateway to trigger a bank transfer.
    // 3. Wait for the webhook confirming the transfer was successful.
    // 4. Update the database.
    // 
    // For this MVP, we simulate the success immediately.

    const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        { $inc: { withdrawnAmount: amount } },
        { new: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Funds successfully transferred to your registered bank account.",
        withdrawnAmount: updatedUser.withdrawnAmount
    });
  } catch (error: any) {
    console.error("Withdraw Error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}
