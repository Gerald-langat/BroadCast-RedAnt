"use client";

import { useState } from "react";
import { LayoutGrid, Menu, X } from "lucide-react";
import UserInformation from "@/components/UserInformation";
import Members from "@/components/Members";
import Widget from "@/components/Widget";

export default function HomeClient({ posts, users }: any) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
  <div className="relative flex md:grid md:grid-cols-8 max-w-7xl mx-auto mt-5 sm:px-5">
  {/* Left Sidebar */}
  <div
    className={`fixed left-0 h-full w-72 bg-gray-50 dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300
      ${leftOpen ? "translate-x-0 top-14" : "-translate-x-full top-14"}
      md:relative md:col-span-2 md:translate-x-0 md:top-0`}
  >
    <div className="p-4 md:sticky md:top-20 overflow-y-auto h-full">
      <UserInformation posts={posts} />
      <Members users={users} />
    </div>
  </div>

  {/* Main Feed */}
 

  {/* Right Sidebar */}
  <div
    className={`fixed right-0 h-full w-64 bg-gray-50 dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300
      ${rightOpen ? "translate-x-0 top-14" : "translate-x-full top-14"}
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
    className="fixed bottom-5 left-5 z-50 md:hidden bg-gray-900 text-white p-2 rounded-full"
  >
    {leftOpen ? <X /> : <Menu />}
  </button>

  {/* Widget Button (Right Sidebar) */}
  <button
    onClick={() => {
      setRightOpen(!rightOpen);
      setLeftOpen(false);
    }}
    className="fixed bottom-5 right-5 z-50 md:hidden bg-gray-900 text-white p-2 rounded-full"
  >
    {rightOpen ? <X /> : <LayoutGrid />}
  </button>
</div>

  );
}
