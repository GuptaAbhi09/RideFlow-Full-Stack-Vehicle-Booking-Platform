import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import Vehicle from "@/models/vehicle.model"
import User from "@/models/user.model"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const vehicle = await Vehicle.findById(id).populate("owner", "name email phoneNumber partnerOnboardingStep")
    
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Fetch vehicle error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, reason } = await req.json()

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await dbConnect()

    const vehicle = await Vehicle.findById(id)
    
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Update vehicle status
    vehicle.status = status
    if (status === "rejected") {
      vehicle.rejectionReason = reason || "Does not meet requirements."
    }
    
    await vehicle.save()

    // If vehicle is approved, update user's step to 8 (Live) and status to approved
    if (status === "approved") {
      await User.findByIdAndUpdate(
        vehicle.owner,
        { 
          partnerOnboardingStep: 8,
          partnerStatus: "approved" 
        },
        { new: true }
      )
    }

    return NextResponse.json({ success: true, message: `Vehicle ${status} successfully` })
  } catch (error) {
    console.error("Update vehicle status error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
