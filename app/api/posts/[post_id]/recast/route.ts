import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

export async function POST(
  req: Request,
  context: { params: Promise<{ post_id: string }> }
) {
  await connectDB();
  const { post_id } = await context.params;
  const { userId, userImg, firstName, nickName } = await req.json();

  const post = await Post.findById(post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!Array.isArray(post.recastedBy)) post.recastedBy = [];
  if (!Array.isArray(post.recastDetails)) post.recastDetails = [];

  if (post.recastedBy.includes(userId)) {
    // Remove recast
    post.recastedBy = post.recastedBy.filter((id: string) => id !== userId);
    post.recastDetails = post.recastDetails.filter(
      (detail: any) => detail.userId !== userId
    );
  } else {
    // Add recast
    post.recastedBy.push(userId);
    post.recastDetails.push({
      userId,
      userImg,
      firstName,
      nickName,
      recastedAt: new Date(),
    });
  }

  await post.save();

  return NextResponse.json({
    message: "Recast updated",
    recastedBy: post.recastedBy,
    recastDetails: post.recastDetails,
  });
}
