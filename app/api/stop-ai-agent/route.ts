// /api/stop-ai-agent/route.ts
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { channel_id } = await req.json();

  const client = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET_KEY!
  );

  const aiUserId = "ai-assistant";

  try {
    const channel = client.channel("messaging", channel_id);

    // ✅ Remove AI from the channel
    await channel.removeMembers([aiUserId]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error stopping AI agent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
