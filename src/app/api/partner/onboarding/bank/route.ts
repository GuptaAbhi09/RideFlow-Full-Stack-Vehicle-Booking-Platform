import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import PartnerBank from "@/models/partnerBank.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, accountNumber, ifscCode, accountHolderName, upiId } = body;

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json({ error: "Missing required bank information" }, { status: 400 });
    }

    await connectDb();

    // Use findOneAndUpdate with upsert to create or update the bank details
    await PartnerBank.findOneAndUpdate(
      { owner: session.user.id },
      {
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        upiId: upiId || "",
        status: "not_added"
      },
      { upsert: true, new: true }
    );

    // Update user onboarding step and set role to partner, status to pending
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        partnerOnboardingStep: 3,
        role: "partner",
        partnerStatus: "pending"
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Bank details saved and application submitted successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
      }
    });
  } catch (error: any) {
    console.error("Bank Onboarding Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const bank = await PartnerBank.findOne({ owner: session.user.id });

    return NextResponse.json({ bank });
  } catch (error: any) {
    console.error("Fetch Bank Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
