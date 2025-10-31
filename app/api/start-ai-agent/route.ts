// /api/start-ai-agent/route.ts
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { channel_id } = await req.json();

  const client = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_SECRET_KEY!
  );

  const aiUserId = "ai-assistant";

  try {
    // ✅ Add the AI user to the channel
    const channel = client.channel("messaging", channel_id);
    await channel.addMembers([aiUserId]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
