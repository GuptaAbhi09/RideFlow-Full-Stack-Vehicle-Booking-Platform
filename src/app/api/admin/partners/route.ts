import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/db"
import User from "@/models/user.model"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Fetch all partners
    const partners = await User.find({ role: "partner" })
      .select("-password")
      .sort({ createdAt: -1 })

    return NextResponse.json(partners)

  } catch (error) {
    console.error("Fetch all partners error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
