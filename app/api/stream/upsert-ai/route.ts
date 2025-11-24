import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET_KEY!
    );

    await client.upsertUser({
      id: "ai-assistant",
      name: "AI Assistant",
      image: "https://cdn-icons-png.flaticon.com/512/4712/4712104.png",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("AI user upsert error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
