"use client";

import createCommentAction from "@/app/actions/createCommentAction";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { IProfileBase } from "@/mongodb/models/profile";

function CommentForm({ postId }: { postId: string }) {
  const { user } = useUser();
  const ref = useRef<HTMLFormElement>(null);
  const [profile, setProfile] = useState<IProfileBase | null>(null);

  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const createCommentActionWithPostId = createCommentAction.bind(null, postId);

  const handleCommentAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData;
    ref.current?.reset();

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await createCommentActionWithPostId(formDataCopy);
    } catch (error) {
      console.error(`Error creating comment: ${error}`);

      // Display toast
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
      <Avatar>
        <AvatarImage src={profile?.userImg} />
        <AvatarFallback>
          {profile?.firstName?.charAt(0)}
          {profile?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 border rounded-full px-3 py-2">
        <input
          type="text"
          name="commentInput"
          placeholder="Add a comment..."
          className="outline-none flex-1 text-sm bg-transparent"
        />
        <button type="submit" hidden>
          Comment
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
