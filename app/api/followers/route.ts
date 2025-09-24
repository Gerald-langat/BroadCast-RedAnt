import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { NextResponse } from "next/server"; // your schema

// GET -> return all following IDs for a user
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ following: [] });

  const docs = await Followers.find({ follower: userId });
  const following = docs.map((doc) => doc.following);

  return NextResponse.json({ following });
}

// POST -> follow someone
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  await Followers.create({
    followerUserId: body.followerUserId,
    followingUserId: body.followingUserId,
  });

  return NextResponse.json({ ok: true });
}

// DELETE -> unfollow someone
export async function DELETE(req: Request) {
  await connectDB();
  const body = await req.json();

  await Followers.deleteOne({
    followerUserId: body.followerUserId,
    followingUserId: body.followingUserId,
  });

  return NextResponse.json({ ok: true });
}
