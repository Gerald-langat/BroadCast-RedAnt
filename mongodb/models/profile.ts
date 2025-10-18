import mongoose, { Schema, Model, Document } from "mongoose";

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

export interface IProfileMethods {
  updateImage(userImg: string): Promise<void>;
  removeProfile(): Promise<void>;
}

export interface IProfileModel extends Model<IProfileBase, {}, IProfileMethods> {
  getProfile(userId: string): Promise<IProfileBase | null>;
}

const ProfileSchema = new Schema<IProfileBase, IProfileModel, IProfileMethods>(
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
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🧩 Instance methods
ProfileSchema.methods.removeProfile = async function () {
  try {
    await this.updateOne({
      $set: { isArchived: true, archivedAt: new Date() },
    });
  } catch (error) {
    console.error("Error when soft deleting profile:", error);
  }
};

ProfileSchema.methods.updateImage = async function (userImg: string) {
  try {
    this.userImg = userImg;
    await this.save();
  } catch (error) {
    console.error("Error when updating image:", error);
  }
};

// 🧩 Static method (typed)
ProfileSchema.statics.getProfile = async function (userId: string) {
  return this.findOne({
    userId,
    $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
  }).lean<IProfileBase>(); // ensure plain object
};

// ✅ Fix model recompilation issue
delete mongoose.models.Profile;

// ✅ Correctly type the model export
export const Profile: IProfileModel =
  (mongoose.models.Profile as unknown as IProfileModel) ||
  mongoose.model<IProfileBase, IProfileModel>("Profile", ProfileSchema);
