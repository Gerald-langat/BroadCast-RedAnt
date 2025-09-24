"use client";

import { ThemeToggle } from '@/components/themeToggle';
import { Button } from '@/components/ui/button';
import { useCreateNewChat } from '@/hooks/useCreateNewChat';
import { IPostBase } from '@/mongodb/models/post';
import { IProfileBase } from '@/mongodb/models/profile';
import { useUser } from '@clerk/nextjs';
import { LayoutPanelLeft, MessageCircleMore, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

function Page({ params }: { params: Promise<{ userId: string }> }) {
  const [userData, setUserData] = useState<IProfileBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<IPostBase[]>([]);
  const [followers, setFollowers] = useState<IProfileBase[]>([]);
  const [following, setFollowing] = useState<IProfileBase[]>([]);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"posts" | "followers" | "following">("posts");
  const router = useRouter();
  const { user } = useUser();
  const createNewChat = useCreateNewChat();
  const { userId } = use(params);

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

    // Fetch followers
    fetch(`/api/followers?user_id=${userId}`)
      .then((res) => res.json())
      .then((data: IProfileBase[]) => {
        setFollowers(data || []);
        setFollowersCount(data.length || 0);
      })
      .catch(() => {
        setFollowers([]);
        setFollowersCount(0);
      });

    // Fetch following
    fetch(`/api/followers?user_id=${userId}`)
      .then((res) => res.json())
      .then((data: IProfileBase[]) => {
        setFollowing(data || []);
        setFollowingCount(data.length || 0);
      })
      .catch(() => {
        setFollowing([]);
        setFollowingCount(0);
      });
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data: IProfileBase = await res.json();
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

    const res = await fetch("/api/stream/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const { token } = await res.json();

    const channel = await createNewChat({
      members: [user.id, userId],
      createdBy: user.id,
      userToken: token,
    });

    router.push(`/dashboard?channel=${channel.id}`);
  };

    const handleFollow = async (targetUser: IProfileBase) => {
  try {
    const isFollowing = following.some(f => f.userId === targetUser.userId);

    if (isFollowing) {
      await fetch("/api/followers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUserId: user?.id, followingUserId: targetUser.userId }),
      });
      setFollowing(following.filter(f => f.userId !== targetUser.userId));
    } else {
      await fetch("/api/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUserId: user?.id, followingUserId: targetUser.userId }),
      });
      setFollowing([...following, targetUser]);
    }
  } catch (err) {
    console.error("Follow/unfollow error", err);
  }
};


  if (loading) return <p className="max-w-3xl mx-auto flex min-h-screen justify-center items-center">Loading...</p>;
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
            <div className="border-[1px] rounded-full absolute ml-16 bg-green-600 mt-16">
              <Plus size={20} className="text-white font-mono" />
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
            posts.map((post, idx) => (
              <div key={idx} className=" rounded-lg p-2">
                <p>{post.cast}</p>
              </div>
            ))}

          {activeTab === "followers" &&
            followers.map((follower, idx) => (
              <div key={idx} className=" rounded-lg p-2 flex items-center gap-2">
                <Image src={follower.userImg || "/logo/broadcast.jpg"} 
                width={200} height={200} 
                alt="user image"
                className="w-10 h-10 rounded-full"/>
                <p>
                  {follower.firstName} 
                </p>
                <p>
                   @{follower.nickName}
                </p>
                 <button
                  onClick={() => handleFollow(follower)}
                  className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {following.includes(follower) ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))}

          {activeTab === "following" &&
            following.map((follow, idx) => (
              <div key={idx} className=" rounded-lg p-2 flex items-center gap-2">
                <Image src={follow.userImg || "/logo/broadcast.jpg"} 
                width={200} height={200} 
                alt="user image"
                className="w-10 h-10 rounded-full"/>
                <p>
                  {follow.firstName} @{follow.nickName}
                </p>
                 <button
                    onClick={() => handleFollow(follow)}
                    className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {following.includes(follow) ? "Unfollow" : "Follow"}
                  </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Page;
