import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleType, vehicleNumber, vehicleModel } = body;

    if (!vehicleType || !vehicleNumber || !vehicleModel) {
      return NextResponse.json({ error: "Missing required vehicle information" }, { status: 400 });
    }

    await connectDb();

    // Use findOneAndUpdate with upsert to create or update the vehicle
    await Vehicle.findOneAndUpdate(
      { owner: session.user.id },
      {
        vehicleType: vehicleType === 'auto' ? 'Auto' : vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase(),
        vehicleModel: vehicleModel,
        plateNumber: vehicleNumber,
        imageUrl: "https://placeholder.com/default-vehicle.png",
        baseFare: 50,
        pricePerKm: 12,
        waitingCharge: 2,
        status: "pending",
        isActive: true
      },
      { upsert: true, new: true }
    );

    // Update user onboarding step
    await User.findByIdAndUpdate(
      session.user.id,
      { partnerOnboardingStep: 1 },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Vehicle details saved successfully",
    });
  } catch (error: any) {
    console.error("Vehicle Onboarding Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const vehicle = await Vehicle.findOne({ owner: session.user.id });

    return NextResponse.json({ vehicle });
  } catch (error: any) {
    console.error("Fetch Vehicle Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
