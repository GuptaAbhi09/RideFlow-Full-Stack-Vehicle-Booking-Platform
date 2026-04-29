import connectDb from "@/lib/db"
import User from "@/models/user.model"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { sendMail } from "@/lib/sendMail"

export async function POST(req: Request) {
    try {
        const { name, email, password, phoneNumber } = await req.json()

        if(!name || !email || !password || !phoneNumber) {
            return NextResponse.json(
                {error : "All fields are required"},
                {status: 400}
            )
        }

        await connectDb()

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return NextResponse.json(
                {message: "Email already exists"},
                {status: 400}
            )
        }

        const existingPhone = await User.findOne({phoneNumber});
        if(existingPhone) {
            return NextResponse.json(
                {message: "Phone number already exists"},
                {status: 400}
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            phoneNumber,
            otp,
            otpExpires
        })

        const mailRes = await sendMail(email, otp);
        
        if (!mailRes.success) {
            return NextResponse.json(
                { message: "User created but failed to send verification email" },
                { status: 201 }
            )
        }

        return NextResponse.json(
            { message: "Registration successful. Please verify your email.", email },
            { status: 201 }
        )

    } catch (error) {
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    }
}