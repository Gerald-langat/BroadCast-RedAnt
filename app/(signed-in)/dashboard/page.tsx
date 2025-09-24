"use client"

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useStreamUser } from "@/components/UserSyncWrapper";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Channel, ChannelHeader, MessageInput, MessageList, Thread, useChatContext, Window } from "stream-chat-react";

function Dashboard() {
const router = useRouter();
const { channel, setActiveChannel } = useChatContext()
const { setOpen } = useSidebar();
const [isSynced, setIsSynced] = useState(false);
 const { user, loading, syncUser } = useStreamUser();
useEffect(() => {
  const sync = async () => {
    await syncUser(); // from your UserSyncWrapper
    setIsSynced(true);
  };
  sync();
}, []);

const handleCall = () => {
  if (!channel) return;
  router.push(`/dashboard/video-call/${channel.id}`);
  setOpen(false)
}

const handleLeaveChat = async () => {
  if(!channel || !user?.userId) {
    console.log("No active channel or user");
    return;
  }


const confirm = window.confirm("Are you sure you want to leave the chat?");
if(!confirm) return;

try {
  await channel?.removeMembers([user.userId]);

  setActiveChannel(undefined);

  router.push("/dashboard")
} catch (error) {
  console.error("Error leaving the chat", error)
}
}

  return (
    <div className="flex flex-col w-full flex-1">
      {isSynced && channel ? (
        <Channel>
          <Window>
            <div className="flex items-center justify-between">
              {channel.data?.member_count === 1 ? (
                <ChannelHeader title="Everyone has left this chat!"/>
              ): (
                <ChannelHeader />
              )}
              <div className="flex space-x-2 items-center">
                <Button variant="outline" className="flex items-center gap-2" onClick={handleCall}>
                  <VideoIcon className="w-4 h-4"/>
                  Video Call
                </Button>

                <Button variant="outline" className="flex items-center gap-2" onClick={handleLeaveChat}>
                  <VideoIcon className="text-red-500 hover:text-red-600 hover:bg-red-50"/>
                  Leave Chat
                </Button>
              </div>
             </div>
             <div className="flex-1">
              <MessageList />
              </div>
              <div className="sticky bottom-0 w-full">
                <MessageInput />
              </div>
            
          </Window>
          <Thread />
        </Channel>
      ): (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No chat selected
          </h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or start anew conversation
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
