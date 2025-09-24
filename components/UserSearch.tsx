"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";

type Doc = {
  firstName: string;
  lastName: string;
  nickName: string;
  imageUrl?: string | null;
  userId: string;
  userImg: string;
};

interface UserSearchProps {
  users: Doc[];
  onSelectUser: (user: Doc) => void;
  className?: string;
}

function UserSearch({ users, onSelectUser, className }: UserSearchProps) {
  const [query, setQuery] = useState("");
 const { user } = useUser();

  const filtered = users.filter((u) => u.userId !== user?.id);

  return (
    <div className={className}>
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
        {filtered.map((user) => (
          <div
            key={user.userId}
            onClick={() => onSelectUser(user)}
            className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-muted rounded-lg"
          >
            <img
              src={user.imageUrl || user.userImg}
              alt={user.firstName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>
              {user.firstName} {user.lastName} {"@" + user.nickName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSearch;
