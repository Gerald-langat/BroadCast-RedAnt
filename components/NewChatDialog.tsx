"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
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
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCreateNewChat } from "@/app/hooks/useCreateNewChat";
import UserSearch from "./UserSearch";

type Doc = {
  firstName: string;
  lastName: string;
  nickName: string;
  imageUrl?: string | null;
  userId: string;
  userImg: string;
  userToken?: string;
};

function NewChatDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<Doc[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Doc[]>([]);
  const [groupName, setGroupName] = useState("");
  const createNewChat = useCreateNewChat();
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { setActiveChannel } = useChatContext();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const data: Doc[] = await res.json();

        // remove duplicates
        const unique = data.reduce((acc: Doc[], current) => {
          if (!acc.find((item) => item.userId === current.userId)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setAllUsers(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedUsers([]);
      setGroupName("");
    }
  };

  const handleSelectUser = (user: Doc) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.userId === user.userId)) {
        return prev.filter((u) => u.userId !== user.userId); // remove if already selected
      }
      return [...prev, user];
    });
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
          <UserSearch
            users={allUsers}
            onSelectUser={handleSelectUser}
            className="w-full"
          />

          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Selected Users ({selectedUsers.length})
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {selectedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src={user.imageUrl || user.userImg}
                        alt={user.firstName}
                        width={24}
                        height={24}
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
                      onClick={() => handleSelectUser(user)}
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
