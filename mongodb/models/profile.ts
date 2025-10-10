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
     countyCode: { type: Number },
    constituency: { type: String },
    constituencyCode: { type: Number },
    ward: { type: String },
    wardCode: { type: Number },
    category: { type: String },
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
