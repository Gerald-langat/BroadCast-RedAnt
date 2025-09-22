"use server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IProfileBase, Profile } from "@/mongodb/models/profile";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export const submitCastAction = async (
  cast: string,
  imageUrl?: string,
  scope?: string
) => {
  try {
    // Get authenticated user
    const user = await currentUser();
    if (!user?.id) throw new Error("User not authenticated");

    // Connect to DB
    await connectDB();

    // Fetch full profile from DB
    const userDB: IProfileBase | null = await Profile.findOne({ userId: user.id });
    if (!userDB) throw new Error("User profile not found");

    // Map fields to match Post schema
    const userForPost = {
      userId: userDB.userId,
      firstName: userDB.firstName,
      lastName: userDB.lastName,
      nickName: userDB.nickName,
      userImg: userDB.userImg || "", // must match schema
    };

    // Create the post directly
    const postCreated = await Post.create({
      user: userForPost,
      cast,
      imageUrl: imageUrl || null,
      scope: scope || "Home",
    }); 
    // Revalidate home path
 revalidatePath("/");
 
    const postPlain = postCreated.toObject({ getters: true, versionKey: false });
    console.log("Plain post object:", postPlain);
return postPlain;
   
   

  } catch (err) {
    console.error("submitCastAction error:", err);
    throw err;
  }
};
