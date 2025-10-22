"use client";

import createCommentAction from "@/app/actions/createCommentAction";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SendHorizonal } from "lucide-react";

function CommentForm({ postId }: { postId: string }) {
  const { user } = useUser();
  const ref = useRef<HTMLFormElement>(null);
  const [comment, setComment] = useState("");

  const createCommentActionWithPostId = createCommentAction.bind(null, postId);

  const handleCommentAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData;
    ref.current?.reset();
    setComment(""); // clear input after submission

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await createCommentActionWithPostId(formDataCopy);
    } catch (error) {
      console.error(`Error creating comment: ${error}`);
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
          disabled={!comment.trim()}
          className={`transition ${
            comment.trim()
              ? "text-blue-500 hover:text-blue-600"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <SendHorizonal className="w-10 h-4" />
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
