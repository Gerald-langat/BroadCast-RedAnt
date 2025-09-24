
// app/profile/[userId]/page.tsx
"use client"
import { ThemeToggle } from '@/components/themeToggle';
import { Button } from '@/components/ui/button'
import { useCreateNewChat } from '@/hooks/useCreateNewChat';
import { useUser } from '@clerk/nextjs';
import {  LayoutPanelLeft, MessageCircleMore, MoonIcon, Plus, Settings, SunIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

type Users = {
   id:    string;
  userId:  string; 
  firstName:  string;
  lastName:  string;
  nickName:  string;
  imageUrl: string;
  userImg: string;
  casts: {
    imageUrl: string
  }[]
};

function Page({ params }: { params: Promise<{ userId: string }> }) {
     const [userData, setUserData] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);
     const router = useRouter();
      const { user } = useUser();
    const createNewChat = useCreateNewChat();
  const { userId } = use(params); // 👈 unwrap

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data: Users = await res.json();
        setUserData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

    
    const handleClick = async () => {
      if (!user?.id || !userId) return;
    
      // fetch token from your server
      const res = await fetch("/api/stream/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const { token } = await res.json();
    
      // create or fetch chat
      const channel = await createNewChat({
        members: [user.id, userId],
        createdBy: user.id,
        userToken: token, // pass the token
      });
    
      router.push(`/dashboard?channel=${channel.id}`);
    };

  if (loading) return <p className="max-w-3xl mx-auto flex min-h-screen justify-center items-center">Loading...</p>;
  if (!userData) return <p className="max-w-3xl mx-auto flex min-h-screen">No user found</p>;

  const me = userId === user?.id

  return (
    <div className='max-w-3xl mx-auto flex min-h-screen'>
      <div className='w-full p-4'>
        <div className='flex w-full justify-between'>
             <LayoutPanelLeft size={20}/>
             <p className='font-bold'>Profile</p>
             <ThemeToggle />
        </div>
       
        <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Image src={userData?.imageUrl || "/images/kettle.jpg"} width={200} height={200} alt="profile" className='h-24 w-24 rounded-full p-2'/>
              <div className='border-[1px] rounded-full absolute ml-16 bg-green-600 mt-16'>
                <Plus size={20} className='text-white font-mono'/>
              </div>
            <div>
              <p className='font-bold'>{userData?.firstName}</p>
              <p>@{userData?.nickName}</p>  
            </div>  
            </div>
                <div className='flex space-x-1'>
                  {!me && (
                    <div className='flex items-center gap-1 border-[1px] rounded-md px-2 cursor-pointer' onClick={handleClick}>
              <MessageCircleMore size={16} />
              Chat
            </div>
                  )}
              
            {me && (
              <Button variant='outline'>
            Verify Account
            </Button>
            )}
            
            </div>         
        </div>
        
        <div className='w-full justify-between flex'>
            {me && (
       <Button variant='outline' className='w-1/3'>
            Edit Profile
        </Button>
            )}
            {!me && (
              <Button variant='outline' className='w-1/2 border-amber-400'>
            Buy me coffee
        </Button>
            )}
        
        </div> 

        <div className='flex justify-between items-center p-4 max-w-3xl mx-auto'>
            <div className='border-2 border-x-0 border-t-0 border-green-600 p-2'>4 posts</div>
            <div>4 Followers</div>
            <div>4 Following</div>
        </div>

       <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-3xl mx-auto">
        {userData?.casts?.map((cast, index) => (
          <Image
           key={index}
            src={cast.imageUrl || "/images/kettle.jpg"}
            alt="image"
            width={300}
            height={300}
            className="w-full h-46  rounded-lg"
          />
        ))}
      </div>

      </div>
    </div>
  )
}

export default Page
