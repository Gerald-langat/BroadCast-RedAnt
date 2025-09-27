import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { NextResponse } from "next/server";

// GET /api/followers?userId=123
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ following: [], followers: [] });
  }

  // people this user follows
  const following = await Followers.getAllFollowing(userId);

  // people who follow this user
  const followers = await Followers.getAllFollowers(userId);

  return NextResponse.json({
    following: following?.map((f) => f.following) || [],
    followers: followers?.map((f) => f.follower) || [],
  });
}

// POST -> follow someone
export async function POST(req: Request) {
  await connectDB();
  const { followerUserId, followingUserId } = await req.json();

  if (!followerUserId || !followingUserId) {
    return NextResponse.json(
      { error: "Missing followerUserId or followingUserId" },
      { status: 400 }
    );
  }

  try {
    const follow = await Followers.follow(followerUserId, followingUserId);
    return NextResponse.json(follow);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE -> unfollow someone
export async function DELETE(req: Request) {
  await connectDB();
  const { followerUserId, followingUserId } = await req.json();

  if (!followerUserId || !followingUserId) {
    return NextResponse.json(
      { error: "Missing followerUserId or followingUserId" },
      { status: 400 }
    );
  }

  await Followers.deleteOne({ follower: followerUserId, following: followingUserId });

  return NextResponse.json({ ok: true });
}
