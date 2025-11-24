// app/api/stream/ai-reply/route.ts
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

const client = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body.type;
    const message = body.message;
    const channel_id = body.channel?.id || body.channel_id;

    console.log("Incoming webhook:", type);

    if (type !== "message.new") {
      return NextResponse.json({ received: true });
    }

    if (message.user.id === "ai-assistant") {
      return NextResponse.json({ ignored: true });
    }

    // ---------------------------
    // 1️⃣ CALL CLOUDFLARE AI
    // ---------------------------
    console.log("Calling Cloudflare Workers AI...");

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: message.text }
          ]
        })
      }
    );

    const result = await cfResponse.json();
    console.log("CF RAW RESPONSE:", result);

    const aiResponse =
      result?.result?.response || "Hello! How can I help you?";

    // ---------------------------
    // 2️⃣ SEND MESSAGE TO STREAM
    // ---------------------------
    console.log("Sending AI message to channel:", channel_id);

    const channel = client.channel("messaging", channel_id, {
      created_by_id: "ai-assistant", // required for server-side messaging
    });

    await channel.watch();

    await channel.sendMessage({
      text: aiResponse,
      user_id: "ai-assistant",
    });

    return NextResponse.json({ success: true, reply: aiResponse });
  } catch (error: any) {
    console.error("AI reply error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

