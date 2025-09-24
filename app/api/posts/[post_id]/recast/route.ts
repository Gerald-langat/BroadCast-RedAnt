import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";

export async function POST(req: Request, { params }: { params: { post_id: string } }) {
  await connectDB();
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await Post.findById(params.post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // If user already recasted, remove it (toggle)
  const hasRecasted = post.recasts?.includes(userId);
  if (hasRecasted) {
    post.recasts = post.recasts.filter((id: string) => id !== userId);
  } else {
    post.recasts = [...(post.recasts ?? []), userId];
  }

  await post.save();

  return NextResponse.json(post.recasts);
}
