"use client"

import { formatNumber } from "@/lib/formatnumber";
import { IProfile } from "@/mongodb/models/profile";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function Members() {
    const {user} = useUser();
      const [users, setUsers] = useState<IProfile[]>([]);
    const [following, setFollowing] = useState<string[]>([]); // store following IDs
    const [loading, setLoading] = useState(false);
    
    
      useEffect(() => {
        const fetchUserScope = async () => {
          try {
            setLoading(true);
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch user scope");
    
            const data = await res.json();
            setUsers(data);
          } catch (err) {
            console.error("Error fetching user scope:", err);
            setUsers([]);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserScope();
      }, []);

        // 🔹 Load following list when component mounts
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

    const author = user?.id;

  return (  
      <div className='flex flex-col space-y-1  mr-6 rounded-lg border p-4 mt-1'>
        <div className="flex justify-between items-center">
           <p>members {formatNumber(users.length)}</p>
            <Link href="/members" className="text-xs cursor-pointer text-blue-500">View all members</Link> 
        </div>
        {loading && <p>Loading...</p>}   
      {users.map(user => (
        <div className="flex justify-between items-center gap-2 " key={user._id}>
          <Link href={`/profile/${user?.userId}`} className="flex items-center gap-2" >
            <Image src={user.userImg || "/logo/broadcast.jpg"} 
              width={200}
              height={200}
              alt="user-image"
              className="w-8 h-8 rounded-full"
              /> 
              <p className="text-sm min-w-13 max-w-13 truncate">{user.firstName}</p>
              <p className="text-sm min-w-13 max-w-13 truncate">{user.nickName}</p>
          </Link>
          {author === user.userId ? (
             <p>You</p>
          ): (
            <button
              onClick={() => handleFollow(user.userId)}
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {following.includes(user?.userId) ? "Unfollow" : "Follow"}
            </button>
          )}
          
        </div>
      ))}
      </div>
  )
}

export default Members
