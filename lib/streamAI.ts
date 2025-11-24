import { StreamChat } from "stream-chat";

const client = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET_KEY!
);

export async function ensureAIUser() {
  try {
    // Try to upsert the AI user
    await client.upsertUser({
      id: "ai-assistant",
      name: "AI Assistant",
      role: "bot", // optional, marks it as bot
    });
    console.log("✅ AI user is registered/ensured in Stream");
  } catch (err) {
    console.error("❌ Failed to ensure AI user:", err);
    throw err;
  }
}
