import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"

// PATCH: Partner initiates Video KYC (sets status to in_progress)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params

    // Check if the user is the partner themselves or an admin
    if (session.user?.id !== id && session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Allow if status is pending, rejected, not_required OR already in_progress
    const currentStatus = user.videoKycStatus || "not_required";
    const isAllowedStatus = ["pending", "rejected", "in_progress"].includes(currentStatus) || 
                           (currentStatus === "not_required" && user.partnerOnboardingStep >= 3);

    console.log(`DEBUG KYC: ID=${id}, Status=${user.videoKycStatus} (effective: ${currentStatus}), Step=${user.partnerOnboardingStep}, Allowed=${isAllowedStatus}`);

    if (!isAllowedStatus) {
      return NextResponse.json({ 
        error: "Video KYC cannot be initiated. Please wait for document approval.",
        details: { status: currentStatus, step: user.partnerOnboardingStep }
      }, { status: 400 })
    }

    // Generate a simple room ID if not exists
    const roomId = user.videoKycRoomId || `kyc-${id.slice(-6)}-${Math.random().toString(36).substring(7)}`

    // Update status to in_progress if it wasn't already
    if (user.videoKycStatus !== "in_progress") {
      user.videoKycStatus = "in_progress"
      user.videoKycRoomId = roomId
      await user.save()
    }

    return NextResponse.json({ 
      message: "Video KYC initiated", 
      status: "in_progress",
      roomId 
    })

  } catch (error) {
    console.error("Initiate Video KYC error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
