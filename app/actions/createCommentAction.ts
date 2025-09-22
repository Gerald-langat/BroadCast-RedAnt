"use server";

import { IProfileBase, Profile } from "@/mongodb/models/profile";
import { Post } from "@/mongodb/models/post";
import connectDB from "@/mongodb/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export default async function createCommentAction(postId: string, formData: FormData) {
  const user = await currentUser();
  if (!user?.id) throw new Error("User not authenticated");

  const commentInput = formData.get("commentInput") as string;
  if (!postId) throw new Error("Post id is required");
  if (!commentInput) throw new Error("Comment input is required");

  // Connect to your database
  await connectDB();

  // Fetch the full profile from your database
  const userDB: IProfileBase | null = await Profile.findOne({ userId: user.id });
  if (!userDB) throw new Error("User profile not found");

  // Find the post
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  // Create the comment
  const comment = {
    user: userDB,  // now you have the full profile
    text: commentInput,
  };

  await post.commentOnPost(comment);
  revalidatePath("/")
}
