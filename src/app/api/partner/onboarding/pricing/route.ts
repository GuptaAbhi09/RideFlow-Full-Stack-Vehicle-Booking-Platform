import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/auth";

// Helper function to upload a File to Cloudinary via stream
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const baseFare = formData.get("baseFare") as string;
    const pricePerKm = formData.get("pricePerKm") as string;
    const waitingCharge = formData.get("waitingCharge") as string;
    const vehicleImageFile = formData.get("vehicleImage") as File | null;

    if (!baseFare || !pricePerKm || !waitingCharge) {
      return NextResponse.json({ error: "Missing required pricing information" }, { status: 400 });
    }

    await connectDb();

    // Fetch existing vehicle to handle partial updates for image
    const existingVehicle = await Vehicle.findOne({ owner: session.user.id });
    
    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle details not found. Please complete step 1 first." }, { status: 400 });
    }

    let imageUrl = existingVehicle.imageUrl;
    // Update image if a new one is provided
    if (vehicleImageFile && vehicleImageFile.size > 0) {
      imageUrl = await uploadToCloudinary(vehicleImageFile, "rideflow/vehicles");
    }

    // Ensure we don't have the default placeholder if a real image wasn't uploaded yet and they didn't upload one now
    // Actually, user said "if previously we take the vehicle image then it's ok but if not then import image also"
    // So if imageUrl is default and they didn't upload one, we should probably enforce it, but let's let them proceed if they uploaded one now.
    if (imageUrl === "https://placeholder.com/default-vehicle.png" && (!vehicleImageFile || vehicleImageFile.size === 0)) {
        return NextResponse.json({ error: "Please upload a vehicle image." }, { status: 400 });
    }

    // Update vehicle pricing
    existingVehicle.baseFare = Number(baseFare);
    existingVehicle.pricePerKm = Number(pricePerKm);
    existingVehicle.waitingCharge = Number(waitingCharge);
    existingVehicle.imageUrl = imageUrl;
    
    // Set status to pending to trigger a new admin review
    existingVehicle.status = 'pending';
    
    await existingVehicle.save();

    // Update user onboarding step to 6 (Fare Pricing completed)
    const user = await User.findById(session.user.id);
    if (user && user.partnerOnboardingStep < 6) {
      user.partnerOnboardingStep = 6;
      await user.save();
    }

    return NextResponse.json({ 
      success: true, 
      message: "Pricing details saved successfully",
    });
  } catch (error: any) {
    console.error("Pricing Onboarding Error:", error);
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
    console.error("Fetch Pricing Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
