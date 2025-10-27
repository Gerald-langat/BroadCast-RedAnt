"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatNumber } from "@/lib/formatnumber";
import Link from "next/link";
import {
  Building2Icon,
  HomeIcon,
  MessageSquareMoreIcon,
  NewspaperIcon,
  PauseCircleIcon,
} from "lucide-react";
import { useProfile } from "./useProfile";

export default function UserInformation({ posts }: { posts: any[] }) {
    const { profile, loadingProfile, error } = useProfile();


  const userPosts = posts?.filter((post) => post.user.userId === profile?.userId);
  const userComments = posts?.flatMap(
    (post) => post?.comments?.filter((c: any) => c.user.userId === profile?.userId) || []
  );

  return (
    <div className="flex flex-col gap-1">
        <div className="flex flex-col justify-center items-center mr-6 rounded-lg border w-full py-4">
      {loadingProfile ? <div className="py-12">loading...</div> : (
        <Link href={`/profile/${profile?.userId}`} className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 mb-5">
              <AvatarImage src={profile?.userImg || ""} />
              <AvatarFallback>
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <p className="font-semibold text-sm">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-xs">@{profile?.nickName}</p>
            </div>
          </Link> 
      )}
         

          <hr className="w-full my-5" />

          <div className="flex justify-between w-full px-4 text-sm">
            <p className="font-semibold text-gray-400">Posts</p>
            <p className="text-blue-400">{formatNumber(userPosts?.length)}</p>
          </div>

          <div className="flex justify-between w-full px-4 text-sm">
            <p className="font-semibold text-gray-400">Comments</p>
            <p className="text-blue-400">{formatNumber(userComments?.length)}</p>
          </div>
        
 </div>
      <div className="flex flex-col space-y-1 mr-6 rounded-lg border w-full p-4 mt-1">
        <Link href="/" className="flex gap-2 items-center">
          <HomeIcon size={18} /> Home
        </Link>
        <Link href="/media" className="flex gap-2 items-center">
          <PauseCircleIcon size={18} /> Media
        </Link>
        <Link href="/news" className="flex gap-2 items-center">
          <NewspaperIcon size={18} /> News
        </Link>
        <Link href="/marketPlace" className="flex gap-2 items-center">
          <Building2Icon size={18} /> MarketPlace
        </Link>
        <Link href="/dashboard" className="flex gap-2 items-center">
          <MessageSquareMoreIcon size={18} /> Messages
        </Link>
      </div>
    </div>
  );
}
