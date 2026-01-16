export const dynamic = "force-dynamic";

import connectDB from "@/mongodb/db";
import { ICommentBase } from "@/mongodb/models/comment";
import { Post } from "@/mongodb/models/post";
import { IProfileBase } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

type RouteParams = {
  post_id: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    await connectDB();

    const { post_id } = await params;

    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const comments = await post.getAllComments();
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching comments" },
      { status: 500 }
    );
  }
}

export interface AddCommentRequestBody {
  user: IProfileBase;
  text: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { post_id } = await params;
    const { user, text }: AddCommentRequestBody = await request.json();

    await connectDB();

    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const comment: ICommentBase = {
      user,
      text,
    };

    await post.commentOnPost(comment);

    return NextResponse.json({ message: "Comment added successfully" });
  } catch {
    return NextResponse.json(
      { error: "An error occurred while adding comment" },
      { status: 500 }
    );
  }
}
