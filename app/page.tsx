"use client";

import useSWR from "swr";
import { useState } from "react";
import { Menu, X, LayoutGrid } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import PostForm from "@/components/PostForm";
import PostFeed from "@/components/PostFeed";
import UserInformation from "@/components/UserInformation";
import Members from "@/components/Members";
import Widget from "@/components/Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomeClient({ user }: { user: any }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Fetch posts and users
  const { data: posts, isLoading: postsLoading } = useSWR("/api/posts", fetcher);
  const { data: users, isLoading: usersLoading } = useSWR("/api/users", fetcher);

  if (postsLoading || usersLoading) {
    return <div className="flex justify-center mt-20 text-gray-500">Loading...</div>;
  }

  return (
   <div className="relative flex lg:grid lg:grid-cols-8 max-w-7xl mx-auto mt-5 ">
  {/* Left Sidebar */}
  <div
    className={`fixed left-0 h-full w-72  shadow-lg z-40 transform transition-transform duration-300
      ${leftOpen ? "translate-x-0 top-14 bg-gray-50 dark:bg-gray-900" : "-translate-x-full top-14"}
      lg:relative lg:col-span-2 lg:translate-x-0 lg:top-0`}
  >
    <div className="p-4 md:sticky md:top-20 overflow-y-auto h-full">
      <UserInformation posts={posts} />
      <Members users={users} />
    </div>
  </div>

  {/* Main Feed */}
  <section
    className="flex-1 w-full lg:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto md:w-auto transition-all duration-300"
  >
    <SignedIn>
      <PostForm user={user} />
    </SignedIn>
    <PostFeed posts={posts} />
  </section>

  {/* Right Sidebar */}
  <div
    className={`fixed right-0 h-full w-64  shadow-lg z-40 transform transition-transform duration-300
      ${rightOpen ? "translate-x-0 top-14 bg-gray-50 dark:bg-gray-900" : "translate-x-full top-14"}
      xl:relative xl:block xl:translate-x-0 xl:col-span-2 md:top-0`}
  >
    <div className="p-4 md:sticky md:top-20 overflow-y-auto h-full">
      <Widget />
    </div>
  </div>

  {/* Menu Button (Left Sidebar) */}
  <button
    onClick={() => {
      setLeftOpen(!leftOpen);
      setRightOpen(false);
    }}
    className="fixed bottom-5 left-5 z-50 md:hidden p-2 rounded-full"
  >
    {leftOpen ? <X /> : <Menu />}
  </button>

  {/* Widget Button (Right Sidebar) */}
  <button
    onClick={() => {
      setRightOpen(!rightOpen);
      setLeftOpen(false);
    }}
    className="fixed bottom-5 right-5 z-50 md:hidden bg-gray-800 text-white p-2 rounded-full"
  >
    {rightOpen ? <X /> : <LayoutGrid />}
  </button>
</div>


  );
}
