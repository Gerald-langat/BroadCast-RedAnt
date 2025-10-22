"use client";

import deletePostAction from '@/app/actions/deleteAccount';
import useFollowContext from '@/app/context/followContext';
import { ThemeToggle } from '@/components/themeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateNewChat } from '@/hooks/useCreateNewChat';
import { IPostDocument } from '@/mongodb/models/post';
import { IProfileBase } from '@/mongodb/models/profile';
import { useUser } from '@clerk/nextjs';
import { LayoutPanelLeft, MessageCircleMore, PencilLineIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

function Page({ params }: { params: Promise<{ userId: string }> }) {
  const [userData, setUserData] = useState<IProfileBase | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [posts, setPosts] = useState<IPostDocument[]>([]);
  const [postsCount, setPostsCount] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<"posts" | "followers" | "following">("posts");
  const router = useRouter();
  const { user } = useUser();
  const createNewChat = useCreateNewChat();
  const { userId } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [File, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { handleFollow, following, followers, followingCount, followersCount, loading  } = useFollowContext();
  
   
  useEffect(() => {
  if (!userId) return;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user?userId=${userId}`);
      const data = await res.json();

      if (res.ok && data) {
        setUserData(data);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUserData(null);
    } finally {
      setLoadingData(false);
    }
  };

  fetchProfile();
}, [userId]);

// Fetch followers and following
useEffect(() => {
  if (!userId) return;

  // Fetch posts
  fetch(`/api/userPosts?user_id=${userId}`)
    .then((res) => res.json())
    .then((data) => {
      setPosts(data || []);
      setPostsCount(data.length || 0);
    })
    .catch(() => {
      setPosts([]);
      setPostsCount(0);
    });
  }, [userId]);
  

const handleClick = async () => {
  if (!user?.id || !userId) return;

  // 🔹 Get user token from your backend
  const res = await fetch("/api/stream/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id }),
  });

  // 🔹 Pass the token to createNewChat
  const channel = await createNewChat({
    members: [user.id, userId],
    createdBy: user.id,
  });

  router.push(`/dashboard?channel=${channel.id}`);
};

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

const handleSubmit = async () => {
  if (!File || !user?.id) return;

  try {
    setLoadingProfile(true);

    const formData = new FormData();
    formData.append("file", File);
    formData.append("upload_preset", "broadcast"); // ⚠️ required

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmzw85kqr/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    const imageUrl = data.secure_url;

    setUserData((prev) => (prev ? { ...prev, userImg: imageUrl } : prev));
    setPreview(null);
    setFile(null);

    // Optionally save to your DB
    await fetch("/api/profile/update-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, userImg: imageUrl }),
    });

  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Failed to update image");
  } finally {
    setLoadingProfile(false);
  }
    closeRef.current?.click();
    toast.success("Profile image updated!");

};

  if (loadingData) return <p className="max-w-3xl mx-auto flex min-h-screen justify-center items-center">Loading...</p>;
  if (!userData) return <p className="max-w-3xl mx-auto flex min-h-screen">No user found</p>;

  const me = userId === user?.id;

  return (
    <div className="max-w-3xl mx-auto flex min-h-screen w-full">
      <div className="w-full p-4">
        {/* Profile Header */}
        <div className="flex w-full justify-between">
          <LayoutPanelLeft size={20} />
          <p className="font-bold">Profile</p>
            <ThemeToggle />
        </div>

        {/* Profile Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src={userData?.userImg || "/images/kettle.jpg"}
              width={200}
              height={200}
              alt="profile"
              className="h-24 w-24 rounded-full p-2"
            />
            <div className="border-[1px] rounded-full absolute ml-14 bg-green-600 mt-16 cursor-pointer" >
               <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={handleImageChange}
              />
               <Dialog>
                  <DialogTrigger asChild>
                      <Plus size={20} className="text-white" />
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Profile Image</DialogTitle>
                    </DialogHeader>
                    {/* Status Image Preview */}
                    {(preview || userData?.userImg) && (
                      <img
                        src={preview || userData?.userImg}
                        alt="status preview"
                        className="h-24 w-24 rounded-md mt-2"
                      />
                    )}
            
                    <DialogFooter className='flex items-center'>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 border-[1px] rounded-md px-2 cursor-pointer w-fit mt-4 p-2 mr-auto"  onClick={() => fileInputRef.current?.click()}>
                      <PencilLineIcon
                        size={20}
                      />
                      change image
                    </div>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                     <button ref={closeRef} className="hidden" />
                      </DialogClose>
                        <Button
                          disabled={loadingProfile}
                          onClick={() => handleSubmit()}
                        >
                          {loadingProfile ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
            <div>
              <p className="font-bold">{userData?.firstName}</p>
              <p>@{userData?.nickName}</p>
            </div>
          </div>         
        </div>

        {/* Buttons */}
        <div className="w-full space-x-4 flex">
          {me && (
            <Button variant="outline" className="w-1/3">
              Edit Profile
            </Button>
          )}
          {!me ? (
            <Button variant="outline" className="w-1/2 border-amber-400">
              Buy me coffee
            </Button>
          ) : (
            <Button variant="outline">Verify Account</Button>
          )}
           <div className="flex space-x-1">
            {!me && (
              <div
                className="flex items-center gap-1 border-[1px] rounded-md px-2 cursor-pointer "
                onClick={handleClick}
              >
                <MessageCircleMore size={16} />
                Chat
              </div>
            )}
          </div>
          {me && (
          <div className='flex items-center gap-1 border-[1px] rounded-md px-2 cursor-pointer'>
                <div
                  onClick={() => { deletePostAction(String(userData._id))}}
                >
                  <p className="text-red-600 cursor-pointer text-sm">Delete Account</p>
                </div>
          </div>
           )} 
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center p-4">
          <div
            className={`cursor-pointer border-2 border-x-0 border-t-0 ${
              activeTab === "posts" ? "border-green-600" : "border-transparent"
            } p-2`}
            onClick={() => setActiveTab("posts")}
          >
            {postsCount} Posts
          </div>
          <div
            className={`cursor-pointer border-2 border-x-0 border-t-0 ${
              activeTab === "followers" ? "border-green-600" : "border-transparent"
            } p-2`}
            onClick={() => setActiveTab("followers")}
          >
            {followersCount} Followers
          </div>
          <div
            className={`cursor-pointer border-2 border-x-0 border-t-0 ${
              activeTab === "following" ? "border-green-600" : "border-transparent"
            } p-2`}
            onClick={() => setActiveTab("following")}
          >
            {followingCount} Following
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
          {activeTab === "posts" &&
            posts.map((post) => (
              <div key={String(post._id)}>
                      <Link href={`fullMedia/${String(post._id)}`}>
                      <p className="px-4 pb-2 mt-2">{post.cast}</p>
                      </Link>
                          {post.imageUrls && post.imageUrls.length > 0 ? (
                            <Link href={`fullMedia/${String(post._id)}`}>
                              <img
                                src={Array.isArray(post.imageUrls) ? post.imageUrls[0] : post.imageUrls}
                                alt="Post Image"
                                className="w-full mx-auto rounded-sm"
                              />
                              </Link>                          
                          ) : post.videoUrl ? (
                            <video
                              src={post.videoUrl || ""}
                              controls
                              muted
                              playsInline
                              className="w-full h-60 mx-auto rounded-sm"
                            />
                          ) : null}
                    </div>
            ))}

          {activeTab === "followers" &&
  followers.map((follower: { userId: string; userImg?: string; firstName?: string; nickName?: string }, idx: number) => {
    const isFollowingBack = following.some(
      (f: { userId: string }) => f.userId === follower.userId
    );
    return (
      <div key={idx} className="rounded-lg p-2 flex items-center gap-2">
        <Image
          src={follower.userImg || "/logo/broadcast.jpg"}
          width={200}
          height={200}
          alt="user image"
          className="w-10 h-10 rounded-full"
        />
        <p>{follower.firstName}</p>
        <p>@{follower.nickName}</p>
        <button
          onClick={() => handleFollow(follower.userId)}
          className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {loading ? "loading" : isFollowingBack ? "Unfollow" : "Follow"}
        </button>
      </div>
    );
  })}


         {activeTab === "following" &&
            following.map((follow: { userId: string; userImg?: string; firstName?: string; nickName?: string }) => (
              <div key={follow.userId} className="rounded-lg p-2 flex items-center gap-2">
                <Image
                  src={follow.userImg || "/logo/broadcast.jpg"}
                  width={200}
                  height={200}
                  alt="user image"
                  className="w-10 h-10 rounded-full"
                />
                <p>
                  {follow.firstName} @{follow.nickName}
                </p>
                <button
                  onClick={() => handleFollow(follow.userId)}
                  className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {following.some((f: any) => f.userId === follow.userId)
                          ? "Unfollow"
                          : "Follow"}
                </button>
              </div>
            ))}

        </div>
      </div>
    </div>
  );
}

export default Page;
