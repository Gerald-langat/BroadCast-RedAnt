import mongoose, { Schema } from "mongoose";

export interface IProfileBase {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  county?: string;
  constituency?: string;
  ward?: string;
  userImg: string;
  acceptedTerms?: boolean;
}

export interface IProfile extends Document, IProfileBase {
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true },
    userImg: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickName: { type: String, required: true },
    county: { type: String },
    constituency: { type: String },
    ward: { type: String },
    acceptedTerms: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

// ✅ Clear cached model to avoid "user.userId required"
delete mongoose.models.Profile;
export const Profile =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
