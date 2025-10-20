"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const FollowCtx = createContext<any>(null);

export const FollowProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  // Fetch followers and following once
  useEffect(() => {
    if (!user?.id) return;

    const fetchFollowData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/followers?userId=${user.id}`);
        const data = await res.json();

        setFollowers(data.followers || []); 
        setFollowersCount(data.followers?.length || 0); 
        setFollowing(data.following || []); 
        setFollowingCount(data.following?.length || 0);
      } catch (err) {
        console.error("Error fetching follow data:", err);
        setFollowers([]);
        setFollowing([]);
        setFollowersCount(0);
        setFollowingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [user?.id]);

  // Follow/Unfollow logic
  const handleFollow = async (targetUserId: string) => {
    if (!user?.id) return;

    const isFollowing = following.some((f) => f.userId === targetUserId);
    const method = isFollowing ? "DELETE" : "POST";

    try {
      await fetch("/api/followers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user.id,
          followingUserId: targetUserId,
        }),
      });

      // Update state instantly (optimistic update)
      setFollowing((prev) =>
        isFollowing
          ? prev.filter((f) => f.userId !== targetUserId)
          : [...prev, { userId: targetUserId }]
      );
    } catch (err) {
      console.error("Error updating follow:", err);
    }
  };

  return (
    <FollowCtx.Provider value={{ following, followers, handleFollow, followersCount, followingCount, loading }}>
      {children}
    </FollowCtx.Provider>
  );
};

const followContext = () => useContext(FollowCtx);
export default followContext;
