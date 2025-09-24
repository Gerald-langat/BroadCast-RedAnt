"use client"

import { IProfile } from "@/mongodb/models/profile";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function Members() {
  const {user} = useUser();
      const [users, setUsers] = useState<IProfile[]>([]);
    const [following, setFollowing] = useState<string[]>([]); // store following IDs
    
    
      useEffect(() => {
        const fetchUserScope = async () => {
          try {
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch user scope");
    
            const data = await res.json();
            setUsers(data);
          } catch (err) {
            console.error("Error fetching user scope:", err);
            setUsers([]);
          }
        };
    
        fetchUserScope();
      }, []);

      

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

  return (  
      <div className='flex flex-col space-y-1  mr-6 rounded-lg border p-4 mt-1'>
     <p>members</p> 
     {users.map(user => (
      <div className="flex justify-between items-center gap-2 flex" key={user._id}>
        <Link href={`/profile/${user?.userId}`} className="flex items-center gap-2" >
           <Image src={user.userImg || "/logo/broadcast.jpg"} 
            width={200}
            height={200}
            alt="user-image"
            className="w-8 h-8 rounded-full"
            /> 
            <p className="text-sm">{user.firstName}</p>
            <p className="text-sm">{user.nickName}</p>
        </Link>
        <button
            onClick={() => handleFollow(user.userId)}
            className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {following.includes(user.userId) ? "Unfollow" : "Follow"}
          </button>
      </div>
        
        
     ))}
    </div>
  )
}

export default Members
