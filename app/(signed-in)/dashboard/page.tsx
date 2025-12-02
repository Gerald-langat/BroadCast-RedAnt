"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useStreamUser } from "@/components/UserSyncWrapper";
import { VideoIcon, XIcon } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  useChatContext,
  Window,
} from "stream-chat-react";

function Dashboard() {
  const router = useRouter();
  const { channel, setActiveChannel } = useChatContext();
  const { setOpen } = useSidebar();
  const { user } = useStreamUser();
  const [aiTyping, setAiTyping] = useState(false);

  // ---------------------------
  // AI Auto-Reply Logic
  // ---------------------------
useEffect(() => {
  if (!channel) return;

  // const channelName = channel.data?.id || channel.id;
  // const isAIChannel = channelName?.startsWith("ai-chat-");

  // if (!isAIChannel) return; // 🚫 stop AI interfering in human chats

  const handleMessage = async (event: any) => {
    const msg = event.message;

     if (msg.user?.id !== "ai-assistant") return;

    try {
      setAiTyping(true);

      const res = await fetch("/api/stream/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message.new",
          message: msg,
          channel: { id: channel.id },
        }),
      });

      const data = await res.json();
      console.log("AI reply:", data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiTyping(false);
    }
  };

  channel.on("message.new", handleMessage);
  return () => channel.off("message.new", handleMessage);
}, [channel]);




useEffect(() => {
  if (!channel) return;

  const handleEvent = (e: any) => {
    if (e.type === "typing.start" && e.user.id === "ai-assistant") {
      setAiTyping(true);
    }
    if (e.type === "typing.stop" && e.user.id === "ai-assistant") {
      setAiTyping(false);
    }
  };

  channel.on(handleEvent);

  return () => {
    channel.off(handleEvent);
  };
}, [channel]);

  // ---------------------------
  // Video call
  // ---------------------------
  const handleCall = () => {
    if (!channel) return;
    router.push(`/dashboard/video-call/${channel.id}`);
    setOpen(false);
  };

  // ---------------------------
  // Leave chat
  // ---------------------------
  const handleLeaveChat = async () => {
    if (!channel || !user?.userId) return;

    const confirmLeave = window.confirm("Are you sure you want to leave the chat?");
    if (!confirmLeave) return;

    try {
      await channel.removeMembers([user.userId]);
      setActiveChannel(undefined);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error leaving the chat", err);
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
                {aiTyping && <span className="loading loading-infinity loading-sm"></span> }
              </div>

              {/* Input */}
              <div className="sticky bottom-0 w-full border-t p-2">
                <MessageInput />
              </div>
            </div>
          </Window>
          <Thread />
        </Channel>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            No chat selected
          </h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or start a new conversation
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
