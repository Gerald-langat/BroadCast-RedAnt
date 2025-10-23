// api/news/route.ts
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Exclude "Personal Account" posts
    const posts = await Post.find({
      category: { $ne: "Personal Account" },
      $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      })
      .lean(); // makes plain JS objects

    // Serialize properly for Next.js
    const serializedPosts = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt?.toString(),
      updatedAt: post.updatedAt?.toString(),
    }));

    return NextResponse.json(serializedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}
