import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "../../../mongodb/db";
import { Profile } from "../../../mongodb/models/profile";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();

    const profile = await Profile.findOne({
      userId: user.id,
      $or: [{ isArchived: false }, { isArchived: { $exists: false } }], // ✅ ignores archived profiles
    }).lean();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found or archived" }, { status: 404 });
    }

    console.log(profile);
    return NextResponse.json(profile, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
