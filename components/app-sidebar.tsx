"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { ChannelFilters, ChannelSort } from "stream-chat";
import { ChannelList, useChatContext } from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";
import { MessageCircleDashed } from "lucide-react";
import streamClient from "@/lib/stream";
import useSWR from "swr";
import { IProfileBase } from "@/mongodb/models/profile";
import { useCreateNewChat } from "@/app/hooks/useCreateNewChat";


const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const { setActiveChannel } = useChatContext();
   const createNewChat = useCreateNewChat();
 
    const { data: profile, error, isLoading } = useSWR<IProfileBase>("/api/profile", fetcher);

    const filters: ChannelFilters = {
        members: { $in: [profile?.userId as string] }, // not Clerk user.id
        type: {$in: ["messaging", "team"] }
      };

    const options = { presence: true, state: true };
    const sort: ChannelSort = {
        last_message_at: -1,
    }

const handleChatWithAI = async () => {
  try {
    if (!profile?.userId) {
      console.error("User not loaded yet");
      return;
    }

    // Create or open an AI chat channel
    const channel = await createNewChat({
      members: [profile.userId, "ai-assistant"],
      createdBy: profile.userId,
    });

    // Watch and activate the channel
    await channel.watch({ presence: true });
    setActiveChannel(channel);

    console.log("✅ AI Chat started with:", channel.id);
  } catch (err) {
    console.error("❌ Failed to start AI chat:", err);
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
                    ):(
                       <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Welcome back</span>
                            <div className="flex space-x-2">
                              <span>{profile?.firstName}</span>
                            <span className="text-gray-400">@{profile?.nickName}</span>
                            </div>
                            
                        </div>
                        <img src={profile?.userImg} className="h-8 w-8 rounded-full " alt={profile?.firstName}/>
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
                    <Button variant="outline" className="w-full">Start New Chat</Button>
                </NewChatDialog>
                <div className="flex items-center"><hr className="w-1/2 mr-1"/>or<hr className="w-1/2 ml-1"/></div>
                <Button variant="outline" className="w-full"   onClick={handleChatWithAI}>Chat with AI</Button>
                {/* chanel list */}
                 {!isLoading && streamClient.userID && (                  
                   <ChannelList
                sort={sort}
                filters={{
                  members: { $in: [streamClient.userID] }, // match connected user
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
                      Your conversations will appear here once you start chatting with others.
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
  )
}