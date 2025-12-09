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
import { ChannelFilters, ChannelSort } from "stream-chat";
import { ChannelList, useChatContext } from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";
import { MessageCircleDashed } from "lucide-react";
import streamClient from "@/lib/stream";
import useSWR from "swr";
import { IProfileBase } from "@/mongodb/models/profile";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useCreateNewChat } from "@/hooks/useCreateNewChat";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { client, setActiveChannel } = useChatContext(); // ✅ stream-chat-react context
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { data: profile, error, isLoading } = useSWR<IProfileBase>(
    "/api/profile",
    fetcher
  );

  const filters: ChannelFilters = {
    members: { $in: [profile?.userId as string] },
    type: { $in: ["messaging", "team"] },
  };

  const options = { presence: true, state: true };
  const sort: ChannelSort = {
    last_message_at: -1,
  };

 const createNewChat = useCreateNewChat();

const handleCreateAIChat = async () => {
  if (!user?.id) {
    console.error("User ID missing");
    return;
  }

  setLoading(true);

  try {
    const channelId = `ai-chat-${user.id}`;
    const members = [user.id, "ai-assistant"];

    const channel = await createNewChat({
      members,
      createdBy: user.id,
    });

    if (!channel) {
      console.error("Failed to create AI chat");
      return;
    }

    await channel.watch({ state: true }); // optional: presence: true
    setActiveChannel(channel);
  } catch (err) {
    console.error("Error creating AI chat:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <Sidebar variant="floating" className="dark:bg-black">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {isLoading ? (
                <span>loading profile...</span>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Welcome back
                    </span>
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <NewChatDialog>
              <Button variant="outline" className="w-full">
                Start New Chat
              </Button>
            </NewChatDialog>
            <div className="flex items-center">
              <hr className="w-1/2 mr-1" /> or <hr className="w-1/2 ml-1" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateAIChat}
              disabled={loading}
            >
              {loading ? "Chatting with AI..." : "Chat with AI"}
            </Button>

            {streamClient.userID && (
              <ChannelList
                sort={sort}
                filters={{
                  members: { $in: [streamClient.userID] },
                  type: "messaging",
                }}
                options={{ state: true, watch: true, presence: true }}
                EmptyStateIndicator={() => (
                  <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                    <div className="mb-4 opacity-30">
                      <MessageCircleDashed className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      Ready to chat?
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                      Your conversations will appear here once you start chatting
                      with others.
                    </p>
                  </div>
                )}
              />
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
