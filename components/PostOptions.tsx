"use client";

import { useEffect, useState } from "react";
import { EyeIcon, MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfile } from "./useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatNumber } from "@/lib/formatnumber";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { IPostDocument } from "@/mongodb/models/post";
import Link from "next/link";
import followContext from "@/app/context/followContext";


function PostOptions({
  postId,
  post,
}: {
  postId: string;
  post: IPostDocument;
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useUser();
  const { profile } = useProfile();

  // Like state
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes ?? []);
  const [viewCount, setViewCount] = useState<number | null>(null);
  // Recast state
  const [recasted, setRecasted] = useState(false);
  const [recastedBy, setRecastedBy] = useState(post.recastedBy ?? []);
  const [recastDetails, setRecastDetails] = useState<
  {
    userId: string;
    userImg?: string;
    firstName?: string;
    nickName?: string;
    recastedAt: string | Date;
  }[]
>(post.recastDetails ?? []);
    const { handleFollow, following } = followContext();



  // Set initial states
  useEffect(() => {
    if (user?.id) {
      setLiked(post.likes?.includes(user.id) ?? false);
      setRecasted(post.recastedBy?.includes(user.id) ?? false);
    }
  }, [post, user]);

  // ✅ LIKE / UNLIKE FUNCTION
  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      toast.error("You must be signed in to like");
      return;
    }

    const newLiked = !liked;
    const newLikes = newLiked
      ? [...likes, user.id]
      : likes.filter((like) => like !== user.id);

    setLiked(newLiked);
    setLikes(newLikes);
      setViewCount((prev) => (prev ?? post.viewCount ?? 0) + 1);

    const endpoint = `/api/posts/${postId}/${newLiked ? "like" : "unlike"}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!response.ok) {
      // rollback on error
      setLiked(!newLiked);
      setLikes(likes);
      toast.error("Failed to update like");
    }
  };

  // ✅ RECAST / UNRECAST FUNCTION
  const toggleRecast = async () => {
    if (!user?.id) {
      toast.error("You must be signed in to recast");
      return;
    }

    const newRecasted = !recasted;
    let updatedRecastedBy, updatedRecastDetails;

    if (newRecasted) {
      // add recast
      updatedRecastedBy = [...recastedBy, user.id];
      updatedRecastDetails = [
        ...recastDetails,
        {
          userId: user.id,
          userImg: profile?.userImg,
          firstName: profile?.firstName,
          nickName: profile?.nickName,
          recastedAt: new Date().toISOString(),
        },
      ];
    } else {
      // remove recast
      updatedRecastedBy = recastedBy.filter((id) => id !== user.id);
      updatedRecastDetails = recastDetails.filter(
        (detail: any) => detail.userId !== user.id
      );
    }

    setViewCount((prev) => (prev ?? post.viewCount ?? 0) + 1);
    setRecasted(newRecasted);
    setRecastedBy(updatedRecastedBy);
    setRecastDetails(updatedRecastDetails);

    const endpoint = `/api/posts/${postId}/${newRecasted ? "recast" : "unrecast"}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        userImg: profile?.userImg,
        firstName: profile?.firstName,
        nickName: profile?.nickName,
      }),
    });

    if (!response.ok) {
      // rollback if failed
      setRecasted(!newRecasted);
      setRecastedBy(recastedBy);
      setRecastDetails(recastDetails);
      toast.error("Failed to update recast");
    }
  };

  const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Check this out!',
        text: `${post?.user?.firstName}`,
        url: `https://broadcastke.com/fullMedia/${postId}`,
      });

      setViewCount((prev) => (prev ?? post.viewCount ?? 0) + 1);
      // Increment viewCount after sharing
      await fetch(`/api/posts/${postId}/view`, {
        method: "POST",
      });

    } catch (error) {
      console.error('Error sharing content:', error);
    }
  } else {
    alert('Web Share API is not supported in your browser.');
  }
};


  const author = user?.id

  return (
    <div>
      <div className="flex justify-between p-4">
        {/* Likes count */}
        <div>
          {likes.length > 0 && (
            <p className="text-xs text-gray-500 hover:underline cursor-pointer">
              {likes.length} likes
            </p>
          )}
        </div>

        {/* Recasted By */}
        <Popover>
          <PopoverTrigger asChild>
            <div>
              {recastDetails.length > 0 && (
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 mb-1">Recasted by:</p>
                  <div className="flex -space-x-2">
                    {recastDetails.map((detail: any, index: number) => (
                      <Avatar key={index} className="w-6 h-6">
                        <AvatarImage
                          src={detail.userImg || "https://github.com/shadcn.png"}
                          alt={detail.userId}
                        />
                        <AvatarFallback>
                          {detail.userId ? detail.userId[0].toUpperCase() : "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="dark:bg-gray-800 bg-white">
            recasts {formatNumber(recastedBy.length)}
            <div className="space-y-2 mt-2">
              {recastDetails.map((detail: any, index: number) => (
                <div key={index} className="flex justify-between">
                <Link href={`/profile/${detail.userId}`}  className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={detail.userImg || "https://github.com/shadcn.png"}
                      alt={detail.userId}
                    />
                    <AvatarFallback>
                      {detail.userId ? detail.userId[0].toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{detail.firstName}</p>
                    <p className="text-gray-500 text-xs">@{detail.nickName}</p>
                  </div>
                </Link>
                   {author === detail.userId ? (
             <p>You</p>
          ): (
            <button
              onClick={() => handleFollow(detail.userId)}
              className="px-3 py-1 rounded-md border-[1px] text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {following.some((f: any) => f.userId === detail.userId)
    ? "Unfollow"
    : "Follow"}
            </button>
          )}
                  </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Comments count */}
        <div>
          {post?.comments && post.comments.length > 0 && 
          ( <p onClick={() => setIsCommentsOpen(!isCommentsOpen)} 
          className="text-xs text-gray-500 cursor-pointer hover:underline" > 
          {post.comments.length} comments </p> 
        )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex p-2 justify-between px-2 border-t">
        <Button variant="ghost" className="postButton" onClick={likeOrUnlikePost}>
          <ThumbsUpIcon
            size={16}
            className={cn("mr-1", liked && "text-[#4881c2] fill-[#4881c2]")}
          />
          Like
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
        >
          <MessageCircle
            size={16}
            className={cn("mr-1", isCommentsOpen && "text-gray-600 fill-gray-600")}
          />
          Comment
        </Button>

        <Button variant="ghost" className="postButton" onClick={toggleRecast}>
          <Repeat2
            size={16}
            className={cn("mr-1", recasted && "text-[#00b894] fill-[#00b894]")}
          />
          {recasted ? "Recasted" : "Recast"}
        </Button>

        <Button variant="ghost" className="postButton">
          <EyeIcon  className="mr-1" size={16} />
          {formatNumber(viewCount || post?.viewCount || 0)}
          Views
        </Button>

        <Button variant="ghost" className="postButton" onClick={handleShare}>
          <Send size={16} className="mr-1" />
          Send
        </Button>
      </div>

        
      {/* Comments */}
      {isCommentsOpen && (
        <div className="p-4">
          {user?.id && <CommentForm postId={postId} />}
          <CommentFeed postId={postId} />
        </div>
      )}
    </div>
  );
}

export default PostOptions;
