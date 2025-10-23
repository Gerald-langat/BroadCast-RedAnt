import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { Post } from "@/mongodb/models/post";

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

    // ✅ Update profile image
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { userImg },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    // ✅ Update all posts belonging to this user
    await Post.updateMany(
      { "user.userId": userId },
      { $set: { "user.userImg": userImg } }
    );

    return NextResponse.json({
      message: "Profile image updated successfully in both profile and posts",
    });
  } catch (error: any) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
