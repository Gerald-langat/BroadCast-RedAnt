// post.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { Comment, IComment, ICommentBase } from "./comment";
import { IProfileBase } from "./profile";

export interface IPostBase {
  user: IProfileBase;
  cast: string;
  currentLevel: string;
  currentValue: string;
  category: string;
  imageUrls: string[] | [];
  comments?: IComment[];
  likes?: string[];
  recastedBy: string[];  // 👈 new
  recastDetails: {
    userId: string;
    userImg: string;
    firstName: string;
    nickName: string;
    recastedAt: Date;
  }[];
  videoUrl: string | null;
  isArchived?: boolean;
  archivedAt?: Date | null; // ✅ added
  viewCount: number;
}

export interface IPost extends IPostBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define the document methods (for each instance of a post)
interface IPostMethods {
  likePost(userId: string): Promise<void>;
  unlikePost(userId: string): Promise<void>;
  commentOnPost(comment: ICommentBase): Promise<void>;
  getAllComments(): Promise<IComment[]>;
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
    currentLevel: { type: String, required: true },
    currentValue: { type: String, required: true, default: "Home" }, // 1-Public, 2-Connections, 3-Only Me

      imageUrls: { type: [String], default: [] },
    videoUrl: { type: String, default: null },
    category: { type: String, required: true, default: "general" },  

    comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
    likes: { type: [String] },
    viewCount: { type: Number, default: 0 },
    recastedBy: {
    type: [String], // store user IDs as plain strings
    default: [],
  },

  recastDetails: {
  type: [
    {
       _id: false,
      userId: String,
      userImg: String,
      firstName: String,
      nickName: String,
      recastedAt: { type: Date, default: Date.now },
    },
  ],
  default: [], // ✅ important
},

     isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },

  },
  {
    timestamps: true,
  }
);

PostSchema.methods.likePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId }, $inc: { viewCount: 1 },  });
  } catch (error) {
    console.log("error when liking post", error);
  }
};

PostSchema.methods.unlikePost = async function (userId: string) {
  try {
    await this.updateOne({ $pull: { likes: userId } });
  } catch (error) {
    console.log("error when unliking post", error);
  }
};

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


PostSchema.methods.commentOnPost = async function (commentToAdd: ICommentBase) {
  try {
    // Create the comment
    const comment = await Comment.create(commentToAdd);

    // Increment viewCount and push comment ID atomically
    await this.updateOne({
      $push: { comments: comment._id },
      $inc: { viewCount: 1 },
    });

  } catch (error) {
    console.log("error when commenting on post", error);
  }
};


PostSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find({
      $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    // ✅ Deep serialization
    const serializedPosts = posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
        viewCount: post.viewCount ?? 0,
      comments:
        post.comments?.map((comment: any) => ({
          ...comment,
          _id: comment._id?.toString() ?? null,
          createdAt: comment.createdAt?.toString() ?? null,
          updatedAt: comment.updatedAt?.toString() ?? null,
        })) || [],
      likes: post.likes || [],
      recastDetails:
        post.recastDetails?.map((r: any) => ({
          userId: r.userId,
          userImg: r.userImg,
          firstName: r.firstName,
          nickName: r.nickName,
          recastedAt: r.recastedAt?.toString() ?? null,
        })) || [],
      createdAt: post.createdAt?.toString() ?? null,
      updatedAt: post.updatedAt?.toString() ?? null,
    }));

    return serializedPosts;
  } catch (error) {
    console.error("Error when getting all posts:", error);
    return [];
  }
};


PostSchema.methods.getAllComments = async function () {
  try {
    await this.populate({
      path: "comments",

      options: { sort: { createdAt: -1 } },
    });
    return this.comments;
  } catch (error) {
    console.log("error when getting all comments", error);
  }
};

export const Post =
  (models.Post as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>("Post", PostSchema);
