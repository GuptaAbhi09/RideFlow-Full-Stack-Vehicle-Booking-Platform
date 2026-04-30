import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"
import Vehicle from "@/models/vehicle.model"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // 1. Stats
    const totalPartners = await User.countDocuments({ role: "partner" })
    const approvedPartners = await User.countDocuments({ role: "partner", partnerStatus: "approved" })
    const pendingPartners = await User.countDocuments({ role: "partner", partnerStatus: "pending" })
    const rejectedPartners = await User.countDocuments({ role: "partner", partnerStatus: "rejected" })

    // 2. Pending Partner Reviews (Initial docs/bank review - Step 3)
    const pendingReviews = await User.find({ 
      role: "partner", 
      partnerStatus: "pending",
      partnerOnboardingStep: { $gte: 3 } 
    }).select("name email partnerOnboardingStep createdAt").limit(10)

    // 3. Pending Video KYC (Step 4 - waiting for call)
    const pendingKyc = await User.find({ 
      role: "partner", 
      partnerStatus: "approved",
      partnerOnboardingStep: 4
    }).select("name email partnerOnboardingStep createdAt").limit(10)

    // 4. Pending Vehicle Reviews
    const pendingVehicles = await Vehicle.find({ status: "pending" })
      .populate("owner", "name email")
      .limit(10)

    return NextResponse.json({
      stats: {
        total: totalPartners,
        approved: approvedPartners,
        pending: pendingPartners,
        rejected: rejectedPartners
      },
      pendingReviews,
      pendingKyc,
      pendingVehicles
    })

  } catch (error) {
    console.error("Admin dashboard API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
