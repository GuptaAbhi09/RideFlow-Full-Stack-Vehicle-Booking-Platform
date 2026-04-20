import connectDb from "@/lib/db"
import User from "@/models/user.model"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        // Parse Body 
        const { name, email, password } = await req.json()

        // Basic Validation 
        if(!name || !email || !password) {
            return NextResponse.json(
                {error : "All fields are required"},
                {status: 400}
            )
        }

        // connect DB
        await connectDb()

        // check existing user
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return NextResponse.json(
                {message: "User already exist"},
                {status: 400}
            )
        }

        // hashed password 
        const hashedPassword = await bcrypt.hash(password,10)

        // create user 
        const user = await User.create({
            name, email, password:hashedPassword
        })

        // return response
        return NextResponse.json(
            user,
            {status: 201}
        )

    } catch (error) {
        return NextResponse.json(
            {error: "Internal Server Eroor"},
            {status: 500}
        )
    }
}