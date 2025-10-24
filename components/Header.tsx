"use client"
import { useScope } from "@/app/context/ScopeContext";
import {  IProfileBase } from "@/mongodb/models/profile";
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
import { useProfile } from "./useProfile";

 function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IProfileBase[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile, loadingProfile, error } = useProfile();

  // 🔹 Use global scope from context
  const { scope,  setScopeCode, setScope } = useScope();


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
    <div className="flex items-center w-full p-2 max-w-6xl mx-auto sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 border-b">
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
    <div className="absolute left-2 right-2 mt-2 border rounded-md max-w-md shadow-lg max-h-60 overflow-y-auto z-50 bg-white  dark:bg-gray-800">
      {loading && (
        <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
          <span>Searching...<span className="loading loading-infinity loading-md"></span></span>
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
        <div onClick={() => {setScope("Home"); setScopeCode(0)}} className="icon cursor-pointer">
          <HomeIcon className="h-5 " />
          <p>Home</p>
        </div>

        <div onClick={() => {setScope(profile?.county ?? "Home"); setScopeCode(profile?.countyCode ?? 0)}} className="icon hidden md:flex cursor-pointer">
          <Map className="h-5" />
          <p>County</p>
        </div>

        <div onClick={() =>{ setScope(profile?.constituency ?? "Home"); setScopeCode(profile?.constituencyCode ?? 0)}} className="icon hidden md:flex cursor-pointer">
          <Flag className="h-5" />
          <p>Constituency</p>
        </div>

        <div onClick={() => { setScope(profile?.ward ?? "Home"); setScopeCode(profile?.wardCode ?? 0)}} className="icon cursor-pointer">
          <MapPin className="h-5" />
          <p>Ward</p>
        </div>        
      </div>
    </div>
  );
}

export default Header;
