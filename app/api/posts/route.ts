// api/posts/route.ts
export const dynamic = "force-dynamic";

import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IProfileBase } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

// type RouteParams = {
//   post_id: string;
// };

export interface AddPostRequestBody {
  user: IProfileBase;
  cast: string;
  imageUrl?: string | null;
  scope: string;    
    recastedBy: string[]
}

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<RouteParams> }
// ) {
//   const { post_id } = await params;
//   const { userId } = await req.json(); // 👈 get current userId from request

//   const post = await Post.findById(post_id);
//   if (!post) {
//     return NextResponse.json({ error: "Post not found" }, { status: 404 });
//   }

//   const hasRecasted = post.recastedBy.includes(userId);

//   if (hasRecasted) {
//     post.recastedBy = post.recastedBy.filter((id: string) => id !== userId);
//   } else {
//     post.recastedBy.push(userId);
//   }
//   await post.updateOne({ $inc: { viewCount: 1 } }); // Increment viewCount on recast

//   await post.save();

//   return NextResponse.json({ recastedBy: post.recastedBy });
// }

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.getAllPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}