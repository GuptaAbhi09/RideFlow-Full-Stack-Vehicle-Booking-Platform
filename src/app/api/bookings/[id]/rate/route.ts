import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, review } = await req.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await connectDb();

    const { id } = await props.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only rate your own rides" }, { status: 403 });
    }

    if (booking.rating) {
      return NextResponse.json({ error: "You have already rated this ride" }, { status: 400 });
    }

    // Save rating on the booking
    booking.rating = rating;
    booking.review = review || "";
    await booking.save();

    // Recalculate average rating for the driver
    if (booking.driverId) {
      const driver = await User.findById(booking.driverId);
      if (driver) {
        const totalRatings = driver.totalRatings || 0;
        const currentAverage = driver.averageRating || 5.0;

        // Calculate new average
        // Math: ((currentAverage * totalRatings) + newRating) / (totalRatings + 1)
        const newAverage = ((currentAverage * totalRatings) + rating) / (totalRatings + 1);

        driver.averageRating = Number(newAverage.toFixed(2));
        driver.totalRatings = totalRatings + 1;
        await driver.save();
      }
    }

    return NextResponse.json({ success: true, message: "Rating submitted successfully" });
  } catch (error: any) {
    console.error("Rating Error:", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
