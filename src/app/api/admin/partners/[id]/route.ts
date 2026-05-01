import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"
import PartnerBank from "@/models/partnerBank.model"
import PartnerDocs from "@/models/partnerDocs.model"
import Vehicle from "@/models/vehicle.model"

// GET: Fetch partner details for review
export async function GET(
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

    const user = await User.findById(id).select("-password")
    if (!user) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    const bankDetails = await PartnerBank.findOne({ owner: id })
    const documents = await PartnerDocs.findOne({ owner: id })
    const vehicle = await Vehicle.findOne({ owner: id })

    return NextResponse.json({
      user,
      bankDetails,
      documents,
      vehicle
    })

  } catch (error) {
    console.error("Fetch partner details error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Update partner status (Approve/Reject)
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

    user.partnerStatus = status
    
    // If approved, we move them to Step 4 (Video KYC) and set KYC status to pending
    if (status === "approved") {
      user.partnerOnboardingStep = 4
      user.videoKycStatus = "pending"
    }
    
    await user.save()

    // Update document status as well
    await PartnerDocs.findOneAndUpdate(
      { owner: id },
      { status: status, rejectionReason: reason || "" }
    )

    return NextResponse.json({ message: `Partner ${status} successfully` })

  } catch (error) {
    console.error("Update partner status error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
