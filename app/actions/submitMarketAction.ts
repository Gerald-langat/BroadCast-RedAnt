"use server";
import connectDB from "@/mongodb/db";
import { Market } from "@/mongodb/models/marketpost";
import { Profile } from "@/mongodb/models/profile";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const submitCastAction = async (
  description: string,
   cost: number,
  productName: string,
  imageUrls?: string[],
  videoUrl?: string,
) => {
  try {
    const user = await currentUser();
    if (!user?.id) throw new Error("User not authenticated");

    await connectDB();

    const userDB = await Profile.findOne({ userId: user.id });
    if (!userDB) throw new Error("User profile not found");

    const userForPost = {
      userId: userDB.userId,
      firstName: userDB.firstName,
      lastName: userDB.lastName,
      nickName: userDB.nickName,
      userImg: userDB.userImg || "",
    };

    const postCreated = await Market.create({
      user: userForPost,
      description,
       cost: Number(cost) || 0,
      productName,
      imageUrls: imageUrls || [],
      videoUrl: videoUrl || null,
     
    });

    revalidatePath("/");
 
   const plainPost = JSON.parse(JSON.stringify(postCreated));

return plainPost; 
  } catch (err) {
    console.error("submitCastAction error:", err);
    throw err;
  }
};
