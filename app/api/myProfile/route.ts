import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, userImg } = await req.json();

    if (!userId || !userImg) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    // ✅ Call the model method
    await profile.updateImage(userImg);

    return NextResponse.json({ message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
