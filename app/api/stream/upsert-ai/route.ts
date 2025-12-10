import { StreamChat } from "stream-chat";

export async function POST() {
  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY!,
    process.env.STREAM_SECRET! // SERVER SECRET
  );

  await serverClient.upsertUser({
    id: "ai-assistant",
    name: "AI Assistant",
    image: "https://i.imgur.com/IC7Zz11.png",
    role: "user"
  });

  return Response.json({ success: true });
}
