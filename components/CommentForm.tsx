"use client";

import createCommentAction from "@/app/actions/createCommentAction";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

function CommentForm({ postId }: { postId: string }) {
  const { user } = useUser();
  const ref = useRef<HTMLFormElement>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const createCommentActionWithPostId = createCommentAction.bind(null, postId);

 const handleCommentAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData;
    setLoading(true);

    try {
      if (!user?.id) throw new Error("User not authenticated");
      await createCommentActionWithPostId(formDataCopy);
      setComment(""); // ✅ clear input after posting
      ref.current?.reset();
    } catch (error) {
      console.error(`Error creating comment: ${error}`);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form
      ref={ref}
      action={(formData) => {
        const promise = handleCommentAction(formData);
        toast.promise(promise, {
          loading: "Posting comment...",
          success: "Comment Posted!",
          error: "Error creating comment",
        });
      }}
      className="flex items-center space-x-1"
    >
      <div className="flex flex-1 border rounded-full px-3 py-2">
        <input
          type="text"
          name="commentInput"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="outline-none flex-1 text-sm bg-transparent"
        />
        <button
          type="submit"
          disabled={!comment.trim() || loading}
          className={`transition ${
            comment.trim()
              ? "text-blue-500 hover:text-blue-600"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
           <SendHorizonal
            className={cn(
              "w-10 h-4 text-blue-500 hover:text-blue-600 transition",
              loading && "animate-pulse opacity-60"
            )}
          />
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
