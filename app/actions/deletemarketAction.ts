"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Market } from "@/mongodb/models/marketpost";
import { DeletePostRequestBody } from "../api/marketPosts/[post_id]/route";

export default async function deletePostAction(postId: string) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const body: DeletePostRequestBody = {
    userId: user.id,
  };

  const post = await Market.findById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.user.userId !== user.id) {
    throw new Error("Post does not belong to the user");
  }

  try {
    await post.removeProduct();
    revalidatePath("market");
  } catch (error) {
    throw new Error("An error occurred while deleting the post");
  }
}
