"use client"

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function followContext() {
        const [following, setFollowing] = useState<string[]>([]); // store following IDs
    const {user} = useUser();

    useEffect(() => {
        const fetchFollowing = async () => {
          try {
            const res = await fetch(`/api/followers?userId=${user?.id}`);
            const data = await res.json();
            // assume API returns an array of following userIds
            setFollowing(data.following || []);
          } catch (err) {
            console.error("Error fetching following list", err);
          }
        };
    
        if (user?.id) fetchFollowing();
      }, [user?.id]);

 const handleFollow = async (targetUserId: string) => {
      try {
        if (following.includes(targetUserId)) {
          // unfollow
          await fetch("/api/followers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ followerUserId: user?.id, followingUserId: targetUserId }),
          });
          setFollowing(following.filter((id) => id !== targetUserId));
        } else {
          // follow
          await fetch("/api/followers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ followerUserId: user?.id, followingUserId: targetUserId }),
          });
          setFollowing([...following, targetUserId]);
        }
      } catch (err) {
        console.error("Follow/unfollow error", err);
      }
    };

    return { following, handleFollow };
}
