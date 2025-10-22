"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";

const FollowCtx = createContext<any>(null);

export const FollowProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  // ✅ SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch follow data");
    return res.json();
  };

  // ✅ Load followers/following with SWR (auto caching & revalidation)
  const {
    data,
    error,
    mutate,
    isLoading,
  } = useSWR(user?.id ? `/api/followers?userId=${user.id}` : null, fetcher);

  const followers = data?.followers || [];
  const following = data?.following || [];
  const followersCount = followers.length;
  const followingCount = following.length;

  // ✅ Follow / Unfollow logic (with optimistic UI update)
  const handleFollow = async (targetUserId: string) => {
    if (!user?.id) return;

    const isFollowing = following.some((f: any) => f.userId === targetUserId);
    const method = isFollowing ? "DELETE" : "POST";

    // --- optimistic update ---
    mutate(
      async (currentData: any) => {
        let updatedFollowing;
        if (isFollowing) {
          updatedFollowing = currentData.following.filter(
            (f: any) => f.userId !== targetUserId
          );
        } else {
          updatedFollowing = [
            ...currentData.following,
            { userId: targetUserId },
          ];
        }

        // Fire the actual request
        await fetch("/api/followers", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerUserId: user.id,
            followingUserId: targetUserId,
          }),
        });

        // Return the updated data for SWR cache
        return { ...currentData, following: updatedFollowing };
      },
      {
        optimisticData: {
          ...data,
          following: isFollowing
            ? following.filter((f: any) => f.userId !== targetUserId)
            : [...following, { userId: targetUserId }],
        },
        rollbackOnError: true, // Revert on failure
        revalidate: true, // Auto re-fetch after success
      }
    );
  };

  return (
    <FollowCtx.Provider
      value={{
        following,
        followers,
        followersCount,
        followingCount,
        handleFollow,
        loading: isLoading,
        error,
        mutate, // in case other components need to manually refresh
      }}
    >
      {children}
    </FollowCtx.Provider>
  );
};

const followContext = () => useContext(FollowCtx);
export default followContext;
