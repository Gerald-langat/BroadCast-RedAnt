"use client";
import { useChatContext } from "stream-chat-react";

export default function MyMessageInput() {
  const { channel } = useChatContext();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("message") as HTMLInputElement;
    const text = input.value.trim();
    if (!text || !channel) return;

    // Send user's message
    await channel.sendMessage({ text });

    // Clear input
    input.value = "";

    // 🧠 Trigger AI response
    try {
      await fetch("/api/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_id: channel.id, text }),
      });
    } catch (error) {
      console.error("AI reply error:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t">
      <input
        type="text"
        name="message"
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-md outline-none"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
}
