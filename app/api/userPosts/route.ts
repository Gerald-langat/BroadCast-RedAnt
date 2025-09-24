import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post, IPostBase } from "@/mongodb/models/post"; // ✅ import the Mongoose model

// GET /api/posts?userId=123
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id"); // notice frontend uses user_id in your page

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const posts: IPostBase[] = await Post.find({ userId }).sort({ createdAt: -1 }).lean();

    if (!posts || posts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
