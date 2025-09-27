import { currentUser } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IPostDocument } from "@/mongodb/models/post";
import { IProfileBase, Profile } from "@/mongodb/models/profile";
import Link from "next/link";
import { Building2Icon, HomeIcon, MessageSquareMoreIcon, NewspaperIcon, PauseCircleIcon, User2Icon } from "lucide-react";
import Members from "./Members";

async function UserInformation({ posts }: { posts: IPostDocument[] }) {
  const user = await currentUser();

  const userPosts = posts?.filter((post) => post.user.userId === user?.id);

  //  The flatMap() method creates a new array by calling a function for each element in the array and then flattening the result into a new array. It is identical to a map() followed by a flat() of depth 1, but flatMap() is often quite useful, as merging both into one method is slightly more efficient. The result of this flatMap() is a new array that contains all comments made by the current user across all posts. It's "flat" because it's a single-level array, not an array of arrays.
  const userComments = posts?.flatMap(
    (post) =>
      post?.comments?.filter((comment) => comment.user.userId === user?.id) ||
      []
  );

     const userDB: IProfileBase | null = await Profile.findOne({ userId: user?.id });
 

  return (
    <>
    <div className="flex flex-col justify-center items-center  mr-6 rounded-lg border py-4">
        <Avatar className="h-16 w-16 mb-5">
        {user?.id ? (
          <AvatarImage src={userDB?.userImg} />
        ) : (
          <AvatarImage src={userDB?.firstName} />
        )}
        <AvatarFallback>
          {userDB?.firstName?.charAt(0)}
          {userDB?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

        <div className="text-center">
          <p className="font-semibold text-sm">
            {userDB?.firstName} {userDB?.lastName}
          </p>

          <p className="text-xs">
            @{userDB?.nickName}
          </p>
        </div>
      <hr className="w-full  my-5" />

      <div className="flex justify-between w-full px-4 text-sm">
        <p className="font-semibold text-gray-400">Posts</p>
        <p className="text-blue-400">{userPosts?.length}</p>
      </div>

      <div className="flex justify-between w-full px-4 text-sm">
        <p className="font-semibold text-gray-400">Comments</p>
        <p className="text-blue-400">{userComments?.length}</p>
      </div>
    </div>
    <div className='flex flex-col space-y-1  mr-6 rounded-lg border p-4 mt-1'>
        <Link href="/" className='flex gap-2 items-center'><HomeIcon size={18} />
        Home</Link>
        <Link href="/media" className='flex gap-2 items-center'><PauseCircleIcon size={18} />
        Media</Link>
        <Link href="/news" className='flex gap-2 items-center'><NewspaperIcon size={18} />
        News</Link>
        <Link href="/marketPlace" className='flex gap-2 items-center'><Building2Icon size={18} />
        MarketPlace</Link>
        <Link href="/dashboard" className='flex gap-2 items-center'><MessageSquareMoreIcon size={18} />
        Messages</Link>
      </div>      
        <div className=''>
          <Members />
        </div>
        </>
  );
}

export default UserInformation;
