import connectDb from "@/lib/db"
import User from "@/models/user.model"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            )
        }

        await connectDb()

        const user = await User.findOne({ email })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email already verified" },
                { status: 200 }
            )
        }

        if (user.otp !== otp) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            )
        }

        if (new Date() > user.otpExpires) {
            return NextResponse.json(
                { error: "OTP has expired" },
                { status: 400 }
            )
        }

        user.isEmailVerified = true
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

        return NextResponse.json(
            { message: "Email verified successfully" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
