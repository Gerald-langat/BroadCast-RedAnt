import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // ✅ Exclude posts where category === "Personal Account"
    const posts = await Post.find({
      category: { $ne: "Personal Account" },
      $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      });

    return NextResponse.json(JSON.parse(JSON.stringify(posts)));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}
