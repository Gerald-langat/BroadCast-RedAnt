import mongoose, { Schema } from "mongoose";

export interface IProfileBase {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  county?: string;
  countyCode?: number;
  constituency?: string;
  constituencyCode?: number;
  ward?: string;
  wardCode?: number;
  category?: string;
  userImg?: string;
  acceptedTerms?: boolean;
  isArchived?: boolean;
  archivedAt?: Date | null;
}

export interface IProfile extends Document, IProfileBase {
  createdAt: Date;
  updatedAt: Date;
  updateImage(userId: string): Promise<void>;
  removeProfile(): Promise<void>;


}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true },
    userImg: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickName: { type: String, required: true },
    county: { type: String },
     countyCode: { type: Number },
    constituency: { type: String },
    constituencyCode: { type: Number },
    ward: { type: String },
    wardCode: { type: Number },
    category: { type: String },
    acceptedTerms: { type: Boolean, required: true },

      // 🟢 Add these two for soft delete support
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

ProfileSchema.methods.removeProfile = async function () {
  try {
    console.log("Profile archived:", this._id);
    await this.updateOne({
      $set: { isArchived: true, archivedAt: new Date() },
    });
  } catch (error) {
    console.error("Error when soft deleting post:", error);
  }
};

ProfileSchema.methods.updateImage = async function (userImg: string) {
  try {
    this.userImg = userImg; // update field on the document
    await this.save();      // persist change properly
  } catch (error) {
    console.error("Error when updating image:", error);
  }
};


// ✅ Clear cached model to avoid "user.userId required"
delete mongoose.models.Profile;
export const Profile =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
