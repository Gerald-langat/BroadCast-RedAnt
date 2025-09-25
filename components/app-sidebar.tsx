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
import { useUser } from "@clerk/nextjs"
import { ChannelFilters, ChannelSort } from "stream-chat";
import { ChannelList } from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";
import { useEffect, useState } from "react";
import { MessageCircleDashed } from "lucide-react";
import streamClient from "@/lib/stream";

type UserProfile = {
  firstName: string;
  lastName: string;
  nickName: string;
  imageUrl?: string | null;
  selectedCategory: string;
  selectedCounty: string;
  selectedConstituency: string;
  selectedWard: string;
  userImg: string
  userId: string
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [loading, setLoading] = useState(true);
      const [profile, setProfile] = useState<UserProfile | null>(null);
    const { user } = useUser();

    const filters: ChannelFilters = {
        members: { $in: [profile?.userId as string] }, // not Clerk user.id
        type: {$in: ["messaging", "team"] }
      };

    const options = { presence: true, state: true };
    const sort: ChannelSort = {
        last_message_at: -1,
    }

  // Fetch profile
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/profile");
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data: UserProfile = await res.json();
          setProfile(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, []);

  return (
    <Sidebar variant="floating" >
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton>
                    {loading ? (
                        <span>loading profile...</span>
                    ):(
                       <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Welcome back</span>
                            <span>{profile?.firstName}</span>
                        </div>
                        <img src={profile?.imageUrl || profile?.userImg} className="h-8 w-8 rounded-full " alt={profile?.firstName}/>
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
                {/* chanel list */}
                 {!loading && streamClient.userID && (                  
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