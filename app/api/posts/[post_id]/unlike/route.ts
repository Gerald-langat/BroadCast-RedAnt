import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

interface UnlikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ post_id: string }> } // 👈 params is async now
) {
  await connectDB();

  const { userId }: UnlikePostRequestBody = await request.json();

  // ✅ Await the params before using
  const { post_id } = await context.params;

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await post.unlikePost(userId);

    return NextResponse.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("❌ Error unliking post:", error);
    return NextResponse.json(
      { error: "An error occurred while unliking the post" },
      { status: 500 }
    );
  }
}
