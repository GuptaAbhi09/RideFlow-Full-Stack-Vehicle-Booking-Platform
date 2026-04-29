import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import PartnerDocs from "@/models/partnerDocs.model";
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
    const aadharFile = formData.get("aadhar") as File | null;
    const licenseFile = formData.get("license") as File | null;
    const rcFile = formData.get("rc") as File | null;

    await connectDb();

    // Fetch existing docs to handle partial updates
    const existingDocs = await PartnerDocs.findOne({ owner: session.user.id });

    // Helper to get URL: either from new upload or existing DB record
    const getDocUrl = async (file: File | null, existingUrl: string | undefined, folder: string) => {
      if (file) {
        return await uploadToCloudinary(file, folder);
      }
      return existingUrl;
    };

    // Resolve URLs for all 3 documents
    const aadharUrl = await getDocUrl(aadharFile, existingDocs?.aadharUrl, "rideflow/documents");
    const licenseUrl = await getDocUrl(licenseFile, existingDocs?.licenseUrl, "rideflow/documents");
    const rcUrl = await getDocUrl(rcFile, existingDocs?.rcUrl, "rideflow/documents");

    if (!aadharUrl || !licenseUrl || !rcUrl) {
      return NextResponse.json({ error: "Missing required documents. Please upload all fields." }, { status: 400 });
    }



    // Use findOneAndUpdate with upsert to create or update the docs
    await PartnerDocs.findOneAndUpdate(
      { owner: session.user.id },
      {
        aadharUrl: aadharUrl,
        licenseUrl: licenseUrl,
        rcUrl: rcUrl,
        status: "pending",
        profilePicUrl: "https://placeholder.com/default-profile.png"
      },
      { upsert: true, new: true }
    );

    // Update user onboarding step
    await User.findByIdAndUpdate(
      session.user.id,
      { partnerOnboardingStep: 2 },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Documents saved successfully",
    });
  } catch (error: any) {
    console.error("Document Onboarding Error:", error);
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
    const documents = await PartnerDocs.findOne({ owner: session.user.id });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Fetch Documents Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
