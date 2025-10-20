"use client"

import useFollowContext from '@/app/context/followContext';
import { IProfileBase } from '@/mongodb/models/profile';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'

function AllUsers({ users }: { users: IProfileBase[] }) {
    const {user} = useUser();
    const { handleFollow, following } = useFollowContext();
        // 🔹 Load following list when component mounts
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
              {following.some((f: any) => f.following === user.userId)
                ? "Unfollow"
                : "Follow"}
            </button>

          )}
          
        </div>
      ))}
      </div>
  )
}

export default AllUsers
