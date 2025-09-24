"use client";

import { useChatContext } from "stream-chat-react";
import { useUser } from "@clerk/nextjs";

type CreateNewChatParams = {
  members: string[];
  createdBy: string;
  groupName?: string;
};

export const useCreateNewChat = () => {
  const { client } = useChatContext();
  const { user } = useUser();

  const createNewChat = async ({
    members,
    createdBy,
    groupName,
  }: CreateNewChatParams) => {
    if (!client || !user) {
      throw new Error("Chat client or user not available");
    }

    // ✅ Correct call
    const channel = client.channel("messaging", {
      members,
      created_by_id: createdBy,
      // groupName stored as `name` field (custom data)
      ...(groupName ? { name: groupName } : {}),
    });

    await channel.create();
    return channel;
  };

  return createNewChat;
};
