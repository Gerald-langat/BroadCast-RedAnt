import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { Profile } from "@/mongodb/models/profile";
import { NextResponse } from "next/server";

// GET function is used to get all followers of a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  try {
    await connectDB();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }

     // Get following list
    const followingDocs = await Followers.find({ follower: user_id });

    // Fetch profiles of those users
    const followingProfiles = await Profile.find({
      userId: { $in: followingDocs.map((f) => f.following) },
    }).lean();

    return NextResponse.json(followingProfiles, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching followers" },
      { status: 500 }
    );
  }
}

export interface FollowerRequestBody {
  followerUserId: string;
  followingUserId: string;
}

// POST function is used to add a follower to a user
export async function POST(request: Request) {
  const { followerUserId, followingUserId }: FollowerRequestBody =
    await request.json();
  try {
    await connectDB();

    const follow = await Followers.follow(followerUserId, followingUserId);

    if (!follow) {
      return NextResponse.json(
        { error: "Follow action failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while following" },
      { status: 500 }
    );
  }
}

// DELETE function is used to remove a follower from a user
export async function DELETE(request: Request) {
  const { followerUserId, followingUserId }: FollowerRequestBody =
    await request.json();

  try {
    await connectDB();

    if (!followerUserId || !followingUserId) {
      return NextResponse.json(
        { error: "Follower ID or Following ID not provided" },
        { status: 400 }
      );
    }

    const follow = await Followers.findOne({
      follower: followerUserId,
      following: followingUserId,
    });

    if (!follow) {
      return NextResponse.json(
        { error: "Follow relationship not found" },
        { status: 404 }
      );
    }

    await follow.unfollow();
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while unfollowing" },
      { status: 500 }
    );
  }
}
