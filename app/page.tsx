import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import Widget from "@/components/Widget";
import { Post } from "@/mongodb/models/post";
import { SignedIn } from "@clerk/nextjs";
import connectDB from "@/mongodb/db";

export const revalidate = 0;

export default async function Home() {
  await connectDB();
  const posts = await Post.getAllPosts();

  return (
    <div className="grid grid-cols-8 mt-5 sm:px-5">
  {/* Left sidebar */}
  <section className="hidden md:block md:col-span-2">
    <div className="sticky top-20">
      <UserInformation posts={posts} />
    </div>
  </section>

  {/* Main content */}
  <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full">
    <SignedIn>
      <PostForm />
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
