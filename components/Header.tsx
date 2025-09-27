"use client"
import { useScope } from "@/app/context/ScopeContext";
import { IProfile, IProfileBase } from "@/mongodb/models/profile";
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
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

 function Header() {
const [query, setQuery] = useState("");
  const [results, setResults] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(false);
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

    useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="flex items-center p-2 max-w-6xl mx-auto">
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
     <div className="flex-1 relative">
  <form className="flex items-center gap-2 p-2 rounded-md border shadow-sm mx-2 max-w-md">
    <SearchIcon className="h-4 text-gray-500 dark:text-gray-400" />
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      type="text"
      placeholder="Search"
      className="bg-transparent flex-1 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-sm"
    />
    {query && (
      <XIcon
        size={16}
        className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        onClick={() => setQuery("")}
      />
    )}
  </form>

  {(loading || results.length > 0) && (
    <div className="absolute left-2 right-2 mt-2 border rounded-md max-w-md shadow-lg max-h-60 overflow-y-auto z-50 bg-white  dark:bg-neutral-800">
      {loading && (
        <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
          <span>Searching...</span>
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      )}

      {!loading &&
        results.map((s) => (
          <Link
            href={`/profile/${s?.userId}`}
            key={s._id?.toString()}
            className="flex items-center p-2 gap-2 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <img
              src={s.userImg}
              className="w-8 h-8 rounded-full"
              alt={`${s.firstName} ${s.lastName}`}
            />
            <small className="truncate">
              {s.firstName} {s.lastName} (@{s.nickName})
            </small>
          </Link>
        ))}
    </div>
  )}
  
</div>

    <h2 className="md:mr-10">{scope}</h2>

      <div className="hidden md:flex items-center space-x-4 px-6">
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
