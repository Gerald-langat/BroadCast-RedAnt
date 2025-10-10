"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TimeAgo from "react-timeago";
import { useEffect, useState } from "react";
import { IComment } from "@/mongodb/models/comment";

function CommentFeed({ postId }: { postId: string }) {
   const [post, setPost] = useState<IComment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setPost(data);
    };
    fetchComments();
  }, [postId]);

  const { user } = useUser();


  return (
    <div className="mt-3 space-y-2">
      {post?.map((comment) => (
        <div key={String(comment._id)} className="flex space-x-1">
          <Avatar>
            <AvatarImage src={comment?.user?.userImg} />
            <AvatarFallback>
              {comment?.user?.firstName?.charAt(0)}
              {comment?.user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className=" px-4 py-2 rounded-md w-full sm:w-auto md:min-w-[300px]">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {comment?.user?.firstName} {comment?.user?.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  @{comment?.user?.nickName}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                <TimeAgo date={new Date(comment.createdAt)} />
              </p>
            </div>

            <p className="mt-3 text-sm">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentFeed;
