"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { useUser } from "@clerk/nextjs";
import { LikePostRequestBody } from "@/app/api/posts/[post_id]/like/route";
import { IPostDocument } from "@/mongodb/models/post";
import { cn } from "@/lib/utils";
import { UnlikePostRequestBody } from "@/app/api/posts/[post_id]/unlike/route";
import { Button } from "./ui/button";
import { toast } from "sonner";

function PostOptions({
  postId,
  post,
}: {
  postId: string;
  post: IPostDocument;
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [recasted, setRecasted] = useState(false);
const [recastedBy, setRecastedBy] = useState(post.recastedBy ?? []);


const toggleRecast = async () => {
  if (!user?.id) {
    toast.error("You must be signed in to recast");
    return;
  }

  const originalRecasted = recasted;
  const originalRecastedBy = [...recastedBy];

  setRecasted(!recasted);

  const res = await fetch(`/api/posts/${postId}/recast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      userImg: user.imageUrl, // or wherever you store your user image
    }),
  });

  if (!res.ok) {
    setRecasted(originalRecasted);
    setRecastedBy(originalRecastedBy);
    toast.error("Failed to recast");
    return;
  }

  const data = await res.json();
  setRecastedBy(data.recastedBy);
};



  useEffect(() => {
    if (user?.id && post.likes?.includes(user.id)) {
      setLiked(true);
    }
  }, [post, user]);

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const originalLiked = liked;
    const originalLikes = likes;

    const newLikes = liked
      ? likes?.filter((like) => like !== user.id)
      : [...(likes ?? []), user.id];

    const body: LikePostRequestBody | UnlikePostRequestBody = {
      userId: user.id,
    };

    setLiked(!liked);
    setLikes(newLikes);

    const response = await fetch(
      `/api/posts/${postId}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body }),
      }
    );

    if (!response.ok) {
      setLiked(originalLiked);
      throw new Error("Failed to like post");
    }

    const fetchLikesResponse = await fetch(`/api/posts/${postId}/like`);
    if (!fetchLikesResponse.ok) {
      setLikes(originalLikes);
      throw new Error("Failed to fetch likes");
    }

    const newLikesData = await fetchLikesResponse.json();

    setLikes(newLikesData);
  };

  return (
    <div className="">
      <div className="flex justify-between p-4">
        <div>
          {likes && likes.length > 0 && (
            <p className="text-xs text-gray-500 cursor-pointer hover:underline">
              {likes.length} likes
            </p>
          )}
        </div>
        {recastedBy.length > 0 && (
          <div>
            <p className="text-xs text-gray-500">Recasted by:</p>
            <ul className="text-xs text-gray-600">
              {[...new Set(recastedBy)].map((uid) => (
                <li key={uid}>{uid}</li>
              ))}
            </ul>

          </div>
        )}
        <div>
         
          {post?.comments && post.comments.length > 0 && (
            <p
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-xs text-gray-500 cursor-pointer hover:underline"
            >
              {post.comments.length} comments
            </p>
          )}
        </div>
      </div>

      <div className="flex p-2 justify-between px-2 border-t">
        <Button
          variant="ghost"
          className="postButton"
          onClick={likeOrUnlikePost}
        >
          {/* If user has liked the post, show filled thumbs up icon */}
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
            className={cn(
              "mr-1",
              isCommentsOpen && "text-gray-600 fill-gray-600"
            )}
          />
          Comment
        </Button>

        <Button variant="ghost" className="postButton"  onClick={toggleRecast}>
        
          <Repeat2   size={16} className="mr-1" />
            {recasted ? "Recasted" : "Recast"}
        </Button>

        <Button variant="ghost" className="postButton">
          
          <Send size={16} className="mr-1" />
          Send
        </Button>
      </div>

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
