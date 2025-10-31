import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import OpenAI from "openai";

const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET_KEY!
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { channel_id, text } = await req.json();
    const channel = streamClient.channel("messaging", channel_id);

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I didn’t understand that.";

    // Send AI message back to the Stream channel
    await channel.sendMessage({
      user_id: "ai-bot",
      text: reply,
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("AI reply error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
