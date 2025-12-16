"use client";
import { IPostDocument } from "@/mongodb/models/post";
import Post from "./Post";
import { useScope } from "@/app/context/ScopeContext";
import { useMemo } from "react";
import countiesData from "@/counties.json"; // ✅ ensure you import default if it’s exported that way
function PostFeed({ posts }: { posts: IPostDocument[] }) {
  const { scopeName } = useScope();

  const filteredPosts = useMemo(() => {
    if (!posts?.length) return [];

    const counties = Array.isArray(countiesData) ? countiesData : countiesData.counties;

    // 🔍 Identify scope type
    const currentCounty = counties.find((c) => c.county === scopeName);
    const currentConstituency = counties
      .flatMap((c) => c.constituencies)
      .find((ct) => ct.constituency === scopeName);
    const currentWard = counties
      .flatMap((c) => c.constituencies.flatMap((ct: any) => ct.wards))
      .find((w) => w.ward === scopeName);

    // ✅ Filtering logic
    return posts.filter((p) => {
      if (scopeName === "Home") return true;

      // 🏛 County level
      if (currentCounty) {
        const constituencyCodes =
          currentCounty.constituencies?.map((ct: any) => ct.constituency) || [];
        const wardCodes =
          currentCounty.constituencies?.flatMap(
            (ct: any) => ct.wards?.map((w: any) => w.ward) || []
          ) || [];
        return (
          p.scopeName === currentCounty.county ||
          constituencyCodes.includes(p.scopeName) ||
          wardCodes.includes(p.scopeName)
        );
      }

      // 🏘 Constituency level
      if (currentConstituency) {
        const wardCodes =
          currentConstituency.wards?.map((w: any) => w.ward) || [];
        return (
          p.scopeName === currentConstituency.constituency ||
          wardCodes.includes(p.scopeName)
        );
      }

      // 🧱 Ward level
      if (currentWard) {
        return p.scopeName === scopeName;
      }

      return false;
    });
  }, [posts, scopeName]);

  return (
    <div className="space-y-2 pb-20">
      {filteredPosts.map((post) => (
        <Post key={String(post._id)} post={post} />
      ))}
    </div>
  );
}

export default PostFeed;
