"use client"
import { useScope } from "@/app/context/ScopeContext";
import { IProfileBase } from "@/mongodb/models/profile";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Briefcase,
  Flag,
  HomeIcon,
  Map,
  MapPin,
  MessagesSquare,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

 function Header() {
const [user, setUser] = useState<IProfileBase | null>(null);

  // 🔹 Use global scope from context
  const { scope, setScope } = useScope();

  useEffect(() => {
    const fetchUserScope = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch user scope");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user scope:", err);
        setUser(null);
      }
    };

    fetchUserScope();
  }, []);

  return (
    <div className="flex items-center p-2 max-w-7xl mx-auto">
      {/* Logo */}
      <Image
        className="rounded-lg"
        src="/logo/Broadcast.jpg"
        width={40}
        height={40}
        alt="logo"
      />

      {/* Search */}
      {/* SearchIcon */}
      <div className="flex-1">
        <form className="flex items-center space-x-1 bg-gray-100 p-2 rounded-md flex-1 mx-2 max-w-96">
          <SearchIcon className="h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-1 outline-none"
          />
        </form>
      </div>

      <div className="flex items-center space-x-4 px-6">
        <div onClick={() => setScope("Home")} className="icon cursor-pointer">
          <HomeIcon className="h-5 " />
          <p>Home</p>
        </div>

        <div onClick={() => user?.county && setScope(user?.county)} className="icon hidden md:flex cursor-pointer">
          <Map className="h-5" />
          <p>County</p>
        </div>

        <div onClick={() => user?.constituency && setScope(user?.constituency)} className="icon hidden md:flex cursor-pointer">
          <Flag className="h-5" />
          <p>Constituency</p>
        </div>

        <div onClick={() => user?.ward && setScope(user?.ward)} className="icon cursor-pointer">
          <MapPin className="h-5" />
          <p>Ward</p>
        </div>

        
      </div>
    </div>
  );
}

export default Header;
