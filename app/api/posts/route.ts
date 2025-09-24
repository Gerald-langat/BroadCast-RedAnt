// api/posts/route.ts
import connectDB from "@/mongodb/db";
import { IPostBase, Post } from "@/mongodb/models/post";
import { IProfileBase } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
  user: IProfileBase;
  cast: string;
  imageUrl?: string | null;
  scope: string;      // required
  recasts: string[]
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body: AddPostRequestBody = await request.json();
    console.log("Incoming POST body:", body);

    const { user, cast, imageUrl } = body;

    if (!user || !user.userId) throw new Error("User is missing or invalid");
    if (!cast || !cast.trim()) throw new Error("Cast text is required");

    const postData: IPostBase = {
      user,
      cast,
      ...(imageUrl && { imageUrl }),
       scope: "Home",      // or however you handle scope
       recasts: [], 
    };

    console.log("Post data before create:", postData);

    const post = await Post.create(postData);
    console.log("Post created successfully:", post);

    return NextResponse.json({ message: "Post created successfully", post });
  } catch (error: any) {
    console.error("POST creation error:", error);
    return NextResponse.json(
      { error: `An error occurred while creating the post: ${error.message}` },
      { status: 500 }
    );
  }
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
