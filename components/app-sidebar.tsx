"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { ChannelList, useChatContext, ChannelPreviewMessenger } from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";
import { MessageCircleDashed } from "lucide-react";
import streamClient from "@/lib/stream";
import useSWR from "swr";
import { IProfileBase } from "@/mongodb/models/profile";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function AppSidebar() {
  const { client, setActiveChannel } = useChatContext();
  const { user } = useUser();
  const router = useRouter();
  const [loadingAI, setLoadingAI] = useState(false);
  const { data: profile, isLoading } = useSWR<IProfileBase>("/api/profile", fetcher);
const { channel: activeChannel } = useChatContext();


  const sort = { last_message_at: -1 };
  const filters = {
    members: { $in: [profile?.userId || ""] },
    type: "messaging",
  };

  // ---------------------------
  // Create AI chat
  // ---------------------------
  const handleCreateAIChat = async () => {
    if (!user?.id) return;
    setLoadingAI(true);

    try {
      // Upsert AI user on server
      await fetch("/api/stream/upsert-ai", { method: "POST" });

      // Get or create AI channel
     const aiChannel = client.channel("messaging", `ai-chat-${user.id}`);
      await aiChannel.watch();
      setActiveChannel(aiChannel);
      router.push("/dashboard/ai-page");

    } catch (err) {
      console.error("AI chat creation failed:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // ---------------------------
  // Handle human chat click
  // ---------------------------

   const handleClick = () => {
    // 1️⃣ Navigate to dashboard first
    router.push("/dashboard");

    // 2️⃣ Open the dialog after a short delay
    setTimeout(() =>  50); // small delay ensures dashboard renders
  };

  const showHumanChats = !activeChannel?.id?.startsWith("ai-chat-");

  return (
    <Sidebar variant="floating" className="dark:bg-black">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {isLoading ? (
                <span>loading profile...</span>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Welcome back</span>
                    <div className="flex space-x-2">
                      <span>{profile?.firstName}</span>
                      <span className="text-gray-400">@{profile?.nickName}</span>
                    </div>
                  </div>
                  <img
                    src={profile?.userImg}
                    className="h-8 w-8 rounded-full"
                    alt={profile?.firstName}
                  />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <NewChatDialog>
              <Button variant="outline" className="w-full" onClick={handleClick}>
                Start New Chat
              </Button>
            </NewChatDialog>

            <div className="flex items-center">
              <hr className="w-1/2 mr-1" /> or <hr className="w-1/2 ml-1" />
            </div>

            {/* AI Chat Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateAIChat}
              disabled={loadingAI}
            >
              {loadingAI ? "Connecting to AI..." : "Chat with AI"}
            </Button>

            {/* Human chats */}
        {showHumanChats && streamClient.userID && ( 
          <ChannelList sort={sort} filters={{ members: { $in: [streamClient.userID] }, type: "messaging", }} 
          options={{ state: true, watch: true, presence: true }}
           EmptyStateIndicator={() => 
           ( <div className="flex flex-col items-center justify-center text-center py-8 px-4"> 
           <div className="mb-4 opacity-30"> 
            <MessageCircleDashed className="w-12 h-12 text-muted-foreground" />
            </div> <h2 className="text-lg font-semibold text-foreground mb-1"> Ready to chat? </h2> 
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs"> Your conversations will appear here 
              once you start chatting with others. </p> </div> )} /> )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
