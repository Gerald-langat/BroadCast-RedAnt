"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useStreamUser } from "@/components/UserSyncWrapper";
import { VideoIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Channel,
  ChannelHeader,
  MessageList,
  Thread,
  useChatContext,
  Window,
} from "stream-chat-react";

function CustomMessageInput({ channel }: { channel: any }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);

    try {
      // 1️⃣ Send user's message to the Stream channel
      await channel.sendMessage({ text });

      // 2️⃣ If AI assistant is part of the chat, trigger AI reply
      if (channel.data?.member_count === 2 && channel.id.includes("ai-assistant")) {
        await fetch("/api/stream/ai-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: channel.id,
            message: text,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setText("");
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-t p-2">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 p-2 border rounded-lg focus:outline-none"
        disabled={sending}
      />
      <Button onClick={handleSend} disabled={sending || !text.trim()}>
        {sending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const { channel, setActiveChannel } = useChatContext();
  const { setOpen } = useSidebar();
  const { user } = useStreamUser();

  const handleCall = () => {
    if (!channel) return;
    router.push(`/dashboard/video-call/${channel.id}`);
    setOpen(false);
  };

  const handleLeaveChat = async () => {
    if (!channel || !user?.userId) {
      console.log("No active channel or user");
      return;
    }

    const confirmLeave = window.confirm("Are you sure you want to leave the chat?");
    if (!confirmLeave) return;

    try {
      await channel.removeMembers([user.userId]);
      setActiveChannel(undefined);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving the chat", error);
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      {channel ? (
        <Channel>
          <Window>
            <div className="flex flex-col min-h-screen">
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b">
                {channel.data?.member_count === 1 ? (
                  <ChannelHeader title="Everyone has left this chat!" />
                ) : (
                  <ChannelHeader />
                )}
                <div className="flex space-x-2 items-center">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleCall}
                  >
                    <VideoIcon className="w-4 h-4" />
                    Video Call
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleLeaveChat}
                  >
                    <XIcon className="text-red-500 hover:text-red-600 hover:bg-red-50" />
                    Leave Chat
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-2">
                <MessageList />
              </div>

              {/* Input */}
              <div className="sticky bottom-0 w-full">
                <CustomMessageInput channel={channel} />
              </div>
            </div>
          </Window>
          <Thread />
        </Channel>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No chat selected
          </h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or start a new conversation.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
