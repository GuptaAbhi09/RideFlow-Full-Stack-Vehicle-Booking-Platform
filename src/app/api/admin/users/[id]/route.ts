import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"

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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // You could also fetch user's booking history here if needed
    // const bookings = await Booking.find({ customer: id })

    return NextResponse.json({
      user,
      // bookings
    })

  } catch (error) {
    console.error("Fetch user details error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
