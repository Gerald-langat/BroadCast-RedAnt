// post.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { IProfileBase } from "./profile";

export interface IPostBase {
  user: IProfileBase;
  cast: string;
  imageUrls?: string[] | []; 
  videoUrl: string | null;
  isArchived?: boolean;
  archivedAt?: Date | null; // ✅ added
}

export interface IPost extends IPostBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define the document methods (for each instance of a post)
interface IPostMethods {
  removePost(): Promise<void>;
}

// Define the static methods
interface IPostStatics {
  getAllPosts(): Promise<IPostDocument[]>;
}

// Merge the document methods, and static methods with IPost
export interface IPostDocument extends IPost, IPostMethods {}
interface IPostModel extends IPostStatics, Model<IPostDocument> {}

const PostSchema = new Schema<IPostDocument>(
  {
    user: {
      userId: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      nickName: { type: String, required: true },
      userImg: { type: String }
    },
    cast: { type: String, required: true },
      imageUrls: { type: [String], default: [] },
    videoUrl: { type: String, default: null },    
     isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },

  },
  {
    timestamps: true,
  }
);


PostSchema.methods.removePost = async function () {
  try {
    console.log("Soft deleting post:", this._id);
    await this.updateOne({
  $set: { isArchived: true, archivedAt: new Date() },
});
  } catch (error) {
    console.error("Error when soft deleting post:", error);
  }
};

PostSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find({
      $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Deep serialization
    const serializedPosts = posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt?.toString() ?? null,
      updatedAt: post.updatedAt?.toString() ?? null,
    }));

    return serializedPosts;
  } catch (error) {
    console.error("Error when getting all posts:", error);
    return [];
  }
};


export const Status =
  (models.Status as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>("Status", PostSchema);
