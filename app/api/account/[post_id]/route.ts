// app/api/account/[post_id]/route.ts
export const dynamic = "force-dynamic";

import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

type RouteParams = {
  post_id: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  await connectDB();

  const { post_id } = await params;

  try {
    const post = await Profile.findById(post_id);

    if (!post) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch {
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
    const post = await Profile.findById(post_id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await post.removeProfile();

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "An error occurred while deleting the post" },
      { status: 500 }
    );
  }
}
