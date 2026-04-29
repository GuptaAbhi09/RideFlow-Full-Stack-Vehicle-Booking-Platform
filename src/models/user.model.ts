import mongoose, { Document } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "partner" | "admin"
    isEmailVerified: boolean;
    otp: string;
    otpExpires: Date;
    createdAt: Date;
    updatedAt: Date;
    partnerOnboardingStep: number;
    partnerStatus: "none" | "pending" | "approved" | "rejected";
    phoneNumber?: string;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type:String,
        required:true
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        default: "user",
        enum: ["user","partner","admin"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    partnerOnboardingStep: {
        type: Number,
        default: 0,
        min: 0,
        max: 8
    },
    partnerStatus: {
        type: String,
        default: "none",
        enum: ["none", "pending", "approved", "rejected"]
    }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User;