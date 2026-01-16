// posts/[post_id]/route.ts
export const dynamic = "force-dynamic";

import connectDB from "@/mongodb/db";
import { Status } from "@/mongodb/models/statusPost";
import { NextResponse } from "next/server";


type RouteParams = {
  post_id: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  await connectDB();

  try {
    const { post_id } = await params;
    const post = await Status.findById(post_id);
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
  context: { params: Promise<{ post_id: string }> }
) {
  //   auth().protect();

  await connectDB();
  const { post_id } = await context.params;
  const { userId }: DeletePostRequestBody = await request.json();

  try {
    const post = await Status.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.user.userId !== userId) {
      throw new Error("Post does not belong to the user");
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
