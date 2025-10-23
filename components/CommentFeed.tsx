"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TimeAgo from "react-timeago";
import { IComment } from "@/mongodb/models/comment";
import { Trash2 } from "lucide-react";
import useSWR from "swr";

function CommentFeed({ postId }: { postId: string }) {
  const { user } = useUser();

  // ✅ Fetcher for SWR
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
  };

  // ✅ useSWR for automatic caching and revalidation
  const {
    data: comments = [],
    error,
    mutate,
    isLoading,
  } = useSWR(postId ? `/api/posts/${postId}/comments` : null, fetcher);

  const author = comments.find((comment: IComment) => comment.user?.userId === user?.id);

  if (isLoading) return <p className="animate-pulse px-3">Loading comments...</p>;
  if (error) return <p>Error loading comments</p>;

  return (
    <div className="mt-3 space-y-2 w-full">
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 px-3">No comments yet.</p>
      ) : (
        comments.map((comment: IComment) => (
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
                  <p className="text-xs text-gray-400">
                    @{comment?.user?.nickName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">
                    <TimeAgo date={new Date(comment.createdAt)} />
                  </p>

                  {/* Show delete icon only for own comments */}
                  {author && comment.user?.userId === user?.id && (
                    <button
                      onClick={async () => {
                        await fetch(`/api/comments/${comment._id}`, {
                          method: "DELETE",
                        });
                        mutate(); // ✅ instantly revalidate list
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm">{comment.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CommentFeed;
