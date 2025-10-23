import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import Widget from "@/components/Widget";
import { Post } from "@/mongodb/models/post";
import { SignedIn } from "@clerk/nextjs";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Members from "@/components/Members";

export const revalidate = 0;

export default async function Home() {
  await connectDB();

  // ✅ Await currentUser properly
  const user = await currentUser();

  // Handle case when no Clerk user is found (unauthenticated)
  if (!user) {
    redirect("/auth");
  }

  // ✅ Fetch profile from MongoDB using Clerk user ID
   const userDB = await Profile.getProfile(user.id);
    const safeUser = userDB ? JSON.parse(JSON.stringify(userDB)) : null;


      const users = await Profile.find().lean(); // 🔑 convert docs to plain objects
      const safeUsers = JSON.parse(JSON.stringify(users)); // ensure no non-serializable values
    
if (!safeUser) {
  redirect("/auth");
}
  // ✅ Fetch all posts
  const posts = await Post.getAllPosts();

  return (
    <div className="grid grid-cols-8 mt-5 sm:px-5">
      {/* Left sidebar */}
      <section className="hidden md:block md:col-span-2">
        <div className="sticky top-20">
          <UserInformation posts={posts} />
          <Members users={safeUsers}/>
        </div>
      </section>

      {/* Main content */}
      <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full">
        <SignedIn>
          <PostForm user={safeUser}/>
        </SignedIn>
        <PostFeed posts={posts} />
      </section>

      {/* Right sidebar */}
      <section className="hidden xl:block justify-center col-span-2">
        <div className="sticky top-20">
          <Widget />
        </div>
      </section>
    </div>
  );
}
