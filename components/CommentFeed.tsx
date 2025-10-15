"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TimeAgo from "react-timeago";
import { useEffect, useState } from "react";
import { IComment } from "@/mongodb/models/comment";
import { Trash2 } from "lucide-react";

function CommentFeed({ postId }: { postId: string }) {
   const [post, setPost] = useState<IComment[]>([]);
     const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true); // start loading
        const res = await fetch(`/api/posts/${postId}/comments`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false); // stop loading
      }
    };
    fetchComments();
  }, [postId]);


  const { user } = useUser();

const author = post.find((comment) => comment.user?.userId === user?.id);
  return (
    <div className="mt-3 space-y-2 w-full">
      {loading ? (
        <p className="animate-pulse">loading Comments...</p>):(
          <>
          {post?.map((comment) => (
    <div key={String(comment._id)} className="flex space-x-2 w-full">
      {/* Avatar */}
      <Avatar>
        <AvatarImage src={comment?.user?.userImg} />
        <AvatarFallback>
          {comment?.user?.firstName?.charAt(0)}
          {comment?.user?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Comment box */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-md w-full">
        <div className="flex justify-between items-start w-full">
          <div>
            <p className="font-semibold">
              {comment?.user?.firstName} {comment?.user?.lastName}
            </p>
            <p className="text-xs text-gray-400">@{comment?.user?.nickName}</p>
          </div>

          {/* Right side — time + trash icon */}
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">
              <TimeAgo date={new Date(comment.createdAt)} />
            </p>
          </div>
            {author && (
              <button
              // onClick={() => handleDelete(comment._id)} // optional delete handler
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={16} />
            </button>
            )}
        </div>

        <p className="mt-3 text-sm">{comment.text}</p>
      </div>
    </div>
  ))}
          </>
      )}
  
</div>

  );
}

export default CommentFeed;
