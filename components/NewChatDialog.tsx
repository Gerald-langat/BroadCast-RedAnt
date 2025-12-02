"use client";

import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { useChatContext } from "stream-chat-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCreateNewChat } from "@/app/hooks/useCreateNewChat";
import UserSearch from "./UserSearch";
import { IProfileBase } from "@/mongodb/models/profile";
import useSWR from "swr";

// ✅ SWR fetcher with deduplication
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users");

  const data: IProfileBase[] = await res.json();

  // Remove duplicates based on userId
  const unique = data.reduce((acc: IProfileBase[], current) => {
    if (!acc.find((item) => item.userId === current.userId)) {
      acc.push(current);
    }
    return acc;
  }, []);

  return unique;
};

function NewChatDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<IProfileBase[]>([]); // ✅ added
  const createNewChat = useCreateNewChat();
  const { user } = useUser();
  const { setActiveChannel } = useChatContext();

  // ✅ useSWR for users
  const { data: allUsers, error, isLoading } = useSWR<IProfileBase[]>(
    "/api/users",
    fetcher
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedUsers([]);
      setGroupName("");
    }
  };

  const handleSelectUser = (user: IProfileBase) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.userId === user.userId)) {
        return prev.filter((u) => u.userId !== user.userId);
      }
      return [...prev, user];
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.userId !== userId));
  };

  

  const handleCreateChat = async () => {
    const totalMembers = selectedUsers.length + 1;
    const isGroupChat = totalMembers > 2;

    const channel = await createNewChat({
      members: [user?.id as string, ...selectedUsers.map((u) => u.userId)],
      createdBy: user?.id as string,
      groupName: isGroupChat ? groupName.trim() || undefined : undefined,
    });

    setActiveChannel(channel);
    setSelectedUsers([]);
    setGroupName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ✅ Handle loading and error states */}
          {isLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}
          {error && <p className="text-sm text-red-500">Failed to load users.</p>}

          {!isLoading && allUsers && (
            <UserSearch
              users={allUsers.map(user => ({
                ...user,
                userImg: user.userImg || '/default-avatar.png'
              }))}
              onSelectUser={handleSelectUser}
              className="w-full"
            />
          )}

          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Selected Users ({selectedUsers.length})
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {selectedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={user.userImg}
                        alt={user.firstName || "User"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.firstName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.lastName}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUser(user.userId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {selectedUsers.length > 1 && (
                <div className="space-y-2">
                  <label
                    htmlFor="groupName"
                    className="text-sm font-medium text-foreground"
                  >
                    Group Name (Optional)
                  </label>
                  <Input
                    id="groupName"
                    type="text"
                    placeholder="Enter a name for your group chat..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default name: &quot;Group chat (
                    {selectedUsers.length + 1} members)&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={selectedUsers.length === 0}
            onClick={handleCreateChat}
          >
            {selectedUsers.length > 1
              ? `Create Group Chat (${selectedUsers.length + 1} members)`
              : selectedUsers.length === 1
              ? "Start Chat"
              : "Create Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewChatDialog;
