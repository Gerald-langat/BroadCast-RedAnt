// app/api/stream/upsert-ai/route.ts
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

export async function POST() {
  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET_KEY! // 👈 your secret (only safe on server)
  );

  try {
    await serverClient.upsertUser({
      id: "ai-assistant",
      name: "AI Assistant",
      image: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
      role: "admin",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("AI user setup failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
