// post.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { IProfileBase } from "./profile";

export interface IPostBase {
  user: IProfileBase;
  imageUrls?: string[];
  videoUrl?: string | null;
  cost: number; // required
  description: string;
  productName: string;
}

export interface IPost extends IPostBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Document methods
interface IPostMethods {
  removePost(): Promise<void>;
}

// Static methods
interface IPostStatics {
  getAllMarketPosts(): Promise<IPostDocument[]>;
}

// Combined document + methods
export interface IPostDocument extends IPost, IPostMethods {}
interface IPostModel extends Model<IPostDocument>, IPostStatics {}

// Schema definition
const PostSchema = new Schema<IPostDocument>(
  {
    user: {
      userId: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      nickName: { type: String, required: true },
      userImg: { type: String, default: "" },
    },
    imageUrls: { type: [String], default: [] },
    videoUrl: { type: String, default: null },
    cost: { type: Number, required: true },
    description: { type: String, required: true },
    productName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Instance method
PostSchema.methods.removePost = async function () {
  try {
    await this.model("Market").deleteOne({ _id: this._id });
  } catch (error) {
    console.error("Error removing post:", error);
  }
};

// Static method
PostSchema.statics.getAllMarketPosts = async function () {
  try {
    const posts = await this.find().sort({ createdAt: -1 }).lean();
    return posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
};

// Model export
export const Market =
  (models.Market as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>("Market", PostSchema);
