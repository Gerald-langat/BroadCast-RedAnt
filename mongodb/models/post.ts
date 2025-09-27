// post.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { Comment, IComment, ICommentBase } from "./comment";
import { IProfileBase } from "./profile";

export interface IPostBase {
  user: IProfileBase;
  cast: string;
  scope: string,
  imageUrl?: string;
  comments?: IComment[];
  likes?: string[];
  recastedBy: string[];  // 👈 new
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
    scope: { type: String, default: "Home" },
    imageUrl: { type: String },
    comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
    likes: { type: [String] },
    recastedBy: {
    type: [String], // store user IDs as plain strings
    default: [],
  },
  },
  {
    timestamps: true,
  }
);

PostSchema.methods.likePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId } });
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


PostSchema.methods.rePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId } });
  } catch (error) {
    console.log("error when liking post", error);
  }
};

PostSchema.methods.unRePost = async function (userId: string) {
  try {
    await this.updateOne({ $pull: { likes: userId } });
  } catch (error) {
    console.log("error when unliking post", error);
  }
};

PostSchema.methods.removePost = async function () {
  try {
    await this.model("Post").deleteOne({ _id: this._id });
  } catch (error) {
    console.log("error when removing post", error);
  }
};

PostSchema.methods.commentOnPost = async function (commentToAdd: ICommentBase) {
  try {
    const comment = await Comment.create(commentToAdd);
    this.comments.push(comment._id);
    await this.save();
  } catch (error) {
    console.log("error when commenting on post", error);
  }
};

PostSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    return posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
      comments: post.comments?.map((comment: any) => ({
        ...comment,
        _id: comment._id.toString(),
      })),
      likes: post.likes || [], // safe, no populate
    }));

  } catch (error) {
    console.log("error when getting all posts", error);
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
