"use server";
import connectDB from "@/mongodb/db";
import { IProfileBase, Profile } from "@/mongodb/models/profile";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { Status } from "@/mongodb/models/statusPost";

export const submitStatusAction = async (
  cast: string,
  imageUrls?: string[],
  videoUrl?: string,  
) => {
  try {
    // Get authenticated user
    const user = await currentUser();
    if (!user?.id) throw new Error("User not authenticated");

    // Connect to DB
    await connectDB();

    // Fetch full profile from DB
    const userDB: IProfileBase | null = await Profile.findOne({ userId: user.id,   $or: [{ isArchived: false }, { isArchived: { $exists: false } }],  });
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
    const postCreated = await Status.create({
      user: userForPost,
      cast,
      imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : [], // array
      videoUrl: videoUrl || null
    }); 
    // Revalidate home path
 revalidatePath("/");
 
   const plainPost = JSON.parse(JSON.stringify(postCreated));

return plainPost; 
   
   

  } catch (err) {
    console.error("submitStatusAction error:", err);
    throw err;
  }
};
