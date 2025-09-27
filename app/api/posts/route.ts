// api/posts/route.ts
import connectDB from "@/mongodb/db";
import { IPostBase, Post } from "@/mongodb/models/post";
import { IProfileBase } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
  user: IProfileBase;
  cast: string;
  imageUrl?: string | null;
  scope: string;    
    recastedBy: string[]
}

export async function POST(
  req: Request,
  { params }: { params: { post_id: string } }
) {
  const { userId } = await req.json(); // 👈 get current userId from request

  const post = await Post.findById(params.post_id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const hasRecasted = post.recastedBy.includes(userId);

  if (hasRecasted) {
    post.recastedBy = post.recastedBy.filter((id: string) => id !== userId);
  } else {
    post.recastedBy.push(userId);
  }

  await post.save();

  return NextResponse.json({ recastedBy: post.recastedBy });
}



export async function GET() {
  try {
    await connectDB();

    const posts = await Post.getAllPosts();

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}
