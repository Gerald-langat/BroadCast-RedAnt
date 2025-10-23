import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

// ✅ Increment view count
export async function POST(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    await connectDB();

    await Post.updateOne(
      { _id: params.post_id },
      { $inc: { viewCount: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing viewCount:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}

// ✅ Fetch post details (including viewCount)
export async function GET(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    await connectDB();

    const post = await Post.findById(params.post_id)
      .populate("comments")
      .populate("user")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
