import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { channel_id } = await req.json();

    // Stop AI bot in Stream
    const res = await fetch(`https://chat.stream-io-api.com/ai/stop`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STREAM_API_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel_id,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Failed to stop AI agent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
