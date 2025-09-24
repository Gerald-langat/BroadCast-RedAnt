'use client'

import streamClient from "@/lib/stream";
import { useCallback, useEffect, useState } from "react";

export type UserProfile = {
  firstName: string;
  lastName: string;
  nickName: string;
  imageUrl?: string | null;
  userId: string;
  userImg: string;
};

export const useStreamUser = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: UserProfile = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncUser = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const tokenProvider = async () => {
        const res = await fetch("/api/stream/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId }),
        });
        if (!res.ok) throw new Error("Failed to fetch token");
        const { token } = await res.json();
        return token;
      };

      await streamClient.connectUser(
        {
          id: user.userId,
          name: user.firstName,
          image: user.imageUrl || user.userImg,
        },
        tokenProvider
      );
    } catch (error) {
      console.error("Failed to sync user", error);
    }
  }, [user]);

  const disconnectUser = useCallback(async () => {
    try {
      await streamClient.disconnectUser();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, fetchUser, syncUser, disconnectUser };
};
