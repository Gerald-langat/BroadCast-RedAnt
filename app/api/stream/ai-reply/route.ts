import { StreamChat } from "stream-chat";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelId, messageText } = body;

    console.log("🟢 Received request for AI reply:", { channelId, messageText });

    if (!channelId || !messageText) {
      return NextResponse.json({ error: "Missing channelId or messageText" }, { status: 400 });
    }

    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET_KEY!
    );

    await client.upsertUser({
      id: "ai-assistant",
      name: "AI Assistant",
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant integrated into this chat app." },
        { role: "user", content: messageText },
      ],
    });

    const aiReply = completion.choices[0]?.message?.content || "I'm not sure how to respond.";

    console.log("🤖 AI generated reply:", aiReply);

    await client.channel("messaging", channelId).sendMessage({
      text: aiReply,
      user_id: "ai-assistant",
    });

    console.log("✅ Sent AI message to channel:", channelId);
    return NextResponse.json({ success: true, aiReply });
  } catch (error: any) {
    console.error("❌ AI Reply Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
