import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { Profile } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

// GET /api/followers?userId=123
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ following: [], followers: [] });
  }

  // Find people this user follows
  const followingDocs = await Followers.find({ follower: userId }).lean();

  // Find people who follow this user
  const followerDocs = await Followers.find({ following: userId }).lean();

  // Populate with real profile data
  const followingProfiles = await Promise.all(
    followingDocs.map(async (f) => {
      const profile = await Profile.findOne({ userId: f.following }).lean();
      return profile;
    })
  );

  const followerProfiles = await Promise.all(
    followerDocs.map(async (f) => {
      const profile = await Profile.findOne({ userId: f.follower }).lean();
      return profile;
    })
  );

  return NextResponse.json({
    following: followingProfiles.filter(Boolean),
    followers: followerProfiles.filter(Boolean),
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
