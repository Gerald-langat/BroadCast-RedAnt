import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

export async function GET(req: Request) {
  try {
    await connectDB();


    let users;

      // return all users if no query
      users = await Profile.find({
  $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
});

    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
