// app/api/posts/[post_id]/route.ts
export const dynamic = "force-dynamic";

import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

type RouteParams = {
  post_id: string;
};


export async function POST(
  req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  await connectDB();

  const { post_id } = await params;
  const { userId } = await req.json();

  const post = await Post.findById(post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const hasRecasted = post.recastedBy.includes(userId);

  if (hasRecasted) {
    post.recastedBy = post.recastedBy.filter(id => id !== userId);
  } else {
    post.recastedBy.push(userId);
  }

  await Post.updateOne(
    { _id: post_id },
    { $inc: { viewCount: 1 } }
  );

  await post.save();

  return NextResponse.json({ recastedBy: post.recastedBy });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  await connectDB();

  const { post_id } = await params;

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching the post" },
      { status: 500 }
    );
  }
}

export interface DeletePostRequestBody {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  await connectDB();

  const { post_id } = await params;
  const { userId }: DeletePostRequestBody = await request.json();

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.user.userId !== userId) {
      return NextResponse.json(
        { error: "Post does not belong to the user" },
        { status: 403 }
      );
    }

    await post.removePost();

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while deleting the post" },
      { status: 500 }
    );
  }
}
