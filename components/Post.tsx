"use client";

import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IPostDocument } from "@/mongodb/models/post";
import PostOptions from "./PostOptions";
import deletePostAction from "@/app/actions/deletePostAction";
import { useUser } from "@clerk/nextjs";
import ReactTimeago from "react-timeago";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();
  const [following, setFollowing] = useState<string[]>([]); // store following IDs
  const videoRef = useRef<HTMLVideoElement | null>(null);

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


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 } // 50% of the video must be visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);


  const isAuthor = user?.id === post.user.userId;
  return (
    <div className="rounded-md border">
      <div className="p-4 flex space-x-2 items-center">
        <div>
          <Avatar>
            <AvatarImage src={post.user.userImg} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-between flex-1">
          <div>
            <div className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              
            </div>
            <p className="text-xs text-gray-400">
              @{post.user.nickName}
            </p>

          </div>

            <p className="text-xs text-gray-400">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>

            <div>
              <Popover>
                <PopoverTrigger>
                  <MoreHorizontal />
                </PopoverTrigger>
                <PopoverContent className="dark:bg-gray-800">
                  {isAuthor ? (
                              <div
                                onClick={() => { deletePostAction(String(post._id))}}
                              >
                                <p className="text-red-600 cursor-pointer">Delete</p>
                              </div>
                            ) : (
                             <p onClick={() => handleFollow(String(post.user.userId))} className="cursor-pointer">{following.includes(String(post.user.userId)) ? "Unfollow" : "Follow"}{`${post.user.firstName} @${post.user.nickName}`}</p> 
                            )}          
                </PopoverContent>
                
              </Popover>
              
            </div>
          
        </div>
      </div>

      <div>
        <Link href={`fullMedia/${String(post._id)}`}>
        <p className="px-4 pb-2 mt-2">{post.cast}</p>
        </Link>
            {post.imageUrls && post.imageUrls.length === 1 ? (
              <Link href={`fullMedia/${String(post._id)}`}>
                <img
                  src={post.imageUrls[0]}
                  alt="Post Image"
                  className="w-full mx-auto"
                />
                </Link>
            ) : post.imageUrls && post.imageUrls.length > 1 ? (
              <Link href={`fullMedia/${String(post._id)}`} className="grid grid-cols-2  gap-1">
                {post.imageUrls.map((url: string, idx: number) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Post Image ${idx + 1}`}
                    className="w-full h-48 mx-auto object-cover"
                  />
                ))}
              </Link>
            ) : post.videoUrl ? (
              <video
                ref={videoRef}
                src={post.videoUrl || ""}
                controls
                muted
                playsInline
                className="w-full h-60 mx-auto rounded-lg"
              />
            ) : null}
      </div>
          
      <PostOptions postId={String(post._id)} post={post} />
    </div>
  );
}

export default Post;
