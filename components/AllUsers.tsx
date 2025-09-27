"use client"
import { IProfile } from '@/mongodb/models/profile'
import { useUser } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function AllUsers({ users }: { users: IProfile[] }) {
    const {user} = useUser();
    const [following, setFollowing] = useState<string[]>([]); // store following IDs
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
    <div className='max-w-2xl mx-auto my-4'>
         {users.map(user => (
        <div className="flex justify-between items-center gap-2 space-y-1" key={user._id}>
          <Link href={`/profile/${user?.userId}`} className="flex items-center gap-2" >
            <Image src={user.userImg || "/logo/broadcast.jpg"} 
              width={200}
              height={200}
              alt="user-image"
              className="w-8 h-8 rounded-md"
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

export default AllUsers
