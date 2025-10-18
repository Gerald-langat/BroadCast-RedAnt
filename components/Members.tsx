"use client"

import followContext from "@/app/context/followContext";
import { formatNumber } from "@/lib/formatnumber";
import { IProfileBase } from "@/mongodb/models/profile";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function Members() {
    const {user} = useUser();
      const [users, setUsers] = useState<IProfileBase[]>([]);
    const [loading, setLoading] = useState(false);
    const { handleFollow, following } = followContext();
    
    
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
