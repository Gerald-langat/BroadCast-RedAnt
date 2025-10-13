import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

export async function POST(
  req: Request,
  context: { params: Promise<{ post_id: string }> }
) {
  await connectDB();
  const { post_id } = await context.params;
  const { userId, userImg } = await req.json(); // ✅ include userImg

  const post = await Post.findById(post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!Array.isArray(post.recastedBy)) {
    post.recastedBy = [];
  }

  if (post.recastedBy.includes(userId)) {
    // remove recast
    post.recastedBy = post.recastedBy.filter((id: string) => {id !== userId});
  } else {
    // add recast
    post.recastedBy.push(userId);

    // ✅ optionally store who recasted with image
    if (!Array.isArray(post.recastDetails)) {
      post.recastDetails = [];
    }

    post.recastDetails.push({
      userId,
      userImg,
      recastedAt: new Date(),
    });
  }

  await post.save();

  return NextResponse.json({
    message: "Recast updated",
    recastedBy: post.recastedBy,
    recastDetails: post.recastDetails || [],
  });
}
