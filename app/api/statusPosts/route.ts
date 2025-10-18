// api/statusPosts/route.ts
import connectDB from "@/mongodb/db";
import { Status } from "@/mongodb/models/statusPost";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectDB();

    const posts = await Status.getAllPosts();
   return NextResponse.json(JSON.parse(JSON.stringify(posts)));
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}
