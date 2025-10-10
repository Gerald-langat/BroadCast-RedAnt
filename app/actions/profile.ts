"use server";

import { currentUser } from "@clerk/nextjs/server";
import connectDB from "../../mongodb/db";
import { NextResponse } from "next/server";
import { Profile } from "@/mongodb/models/profile";

export default async function createProfileAction({
  firstName,
  lastName,
  nickName,
  Category,
  County,
  Constituency,
  countyCode,
  constituencyCode,
  Ward,
  wardCode,
  imageUrl,
  acceptedTerms,
}: {
  firstName: string;
  lastName: string;
  nickName: string;
  Category: string;
  County: string;
  Constituency: string;
  countyCode: number | null;
  constituencyCode: number | null;
  Ward: string;
  wardCode?: number | null;
  imageUrl?: string;
  acceptedTerms: boolean;
}) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
  await connectDB();

  const profile = await Profile.create({
    userId: user.id,            // 👈 now matches schema
    firstName,
    lastName,
    nickName,
    category: Category,
    county: County,    
    countyCode,                 // 👈 now matches schema         
    constituency: Constituency,
    constituencyCode,           // 👈 now matches schema 
    ward: Ward,  
    wardCode,               
    userImg: imageUrl,
    acceptedTerms,              // 👈 now matches schema
  });

 
   const plainPost = JSON.parse(JSON.stringify(profile));

return plainPost; 

} catch (error) {
  console.error("error ", error);
  return NextResponse.json({ error: "failed to add user" }, { status: 500 });
}
  
}
