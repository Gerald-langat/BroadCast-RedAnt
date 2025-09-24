"use client"

import { IProfile } from "@/mongodb/models/profile";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function Members() {
      const [users, setUsers] = useState<IProfile[]>([]);
    
    
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
  return (  
      <div className='flex flex-col space-y-1  mr-6 rounded-lg border p-4 mt-1'>
     <p>members</p> 
     {users.map(user => (
        <Link href={`/profile/${user?.userId}`} className="flex items-center gap-2" key={user._id}>
           <Image src={user.userImg || "/logo/broadcast.jpg"} 
            width={200}
            height={200}
            alt="user-image"
            className="w-8 h-8 rounded-full"
            /> 
            <p className="text-sm">{user.firstName}</p>
            <p className="text-sm">{user.nickName}</p>

        </Link>
        
     ))}
    </div>
  )
}

export default Members
