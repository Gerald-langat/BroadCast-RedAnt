"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Profile } from "@/mongodb/models/profile";
import { DeletePostRequestBody } from "../api/account/[post_id]/route";

export default async function deletePostAction(postId: string) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const body: DeletePostRequestBody = {
    userId: user.id,
  };

  const post = await Profile.findById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== user.id) {
    throw new Error("Post does not belong to the user");
  }

  try {
    await post.removeProfile();
    revalidatePath("myProfile");
  } catch (error) {
    throw new Error("An error occurred while deleting the post");
  }
}
