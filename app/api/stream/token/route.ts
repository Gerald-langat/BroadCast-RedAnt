// app/api/getToken/route.ts
import { NextResponse } from "next/server";
import serverClient from "@/lib/streamServer";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const token = serverClient.createToken(userId);

    return NextResponse.json({ token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
