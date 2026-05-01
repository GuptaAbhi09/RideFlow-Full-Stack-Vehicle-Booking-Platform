import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"

// PATCH: Admin approves or rejects Video KYC
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const { status, reason } = await req.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    user.videoKycStatus = status
    
    if (status === "approved") {
      user.partnerOnboardingStep = 5 // Move to next step (e.g., Vehicle Review or Final Activation)
      user.videoKycRejectionReason = ""
    } else {
      user.videoKycRejectionReason = reason || "Video verification failed"
      // If rejected, keep them at Step 4 so they can retry
    }
    
    await user.save()

    return NextResponse.json({ 
      message: `Video KYC ${status} successfully`,
      status: user.videoKycStatus
    })

  } catch (error) {
    console.error("Admin Video KYC decision error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
