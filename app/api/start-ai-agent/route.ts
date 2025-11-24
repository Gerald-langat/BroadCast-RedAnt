// /api/start-ai-agent/route.ts
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { channel_id } = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
  const apiSecret = process.env.STREAM_API_SECRET_KEY!;
  const client = StreamChat.getInstance(apiKey, apiSecret);

  const aiUserId = "ai-assistant";

  try {
    // Create the AI user if missing
    await client.upsertUser({
      id: aiUserId,
      name: "AI Assistant",
    });

    // Generate a token for it
    const token = client.createToken(aiUserId);

    // Add AI to channel
    const channel = client.channel("messaging", channel_id);
    await channel.addMembers([aiUserId]);

    // Return the token for your frontend AI client
    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    console.error("Error starting AI agent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
