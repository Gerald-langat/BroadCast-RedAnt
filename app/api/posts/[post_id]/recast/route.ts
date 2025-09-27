import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

export async function POST(
  req: Request,
  context: { params: Promise<{ post_id: string }> }
) {
  await connectDB();
  const { post_id } = await context.params;
  const { userId } = await req.json();

  const post = await Post.findById(post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Ensure recastedBy is always an array
  if (!Array.isArray(post.recastedBy)) {
    post.recastedBy = [];
  }

 if (post.recastedBy.includes(userId)) {
  post.recastedBy = post.recastedBy.filter((id: string) => id !== userId);
} else {
  post.recastedBy.push(userId);
}


  await post.save();

  return NextResponse.json({
    message: "Recast updated",
    recastedBy: post.recastedBy,
  });
}
