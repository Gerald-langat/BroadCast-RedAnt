"use client";
import { IPostDocument } from "@/mongodb/models/post";
import Post from "./Post";
import { useScope } from "@/app/context/ScopeContext";
import { useMemo } from "react";
import countiesData from "@/counties.json"; // ✅ ensure you import default if it’s exported that way
function PostFeed({ posts }: { posts: IPostDocument[] }) {
  const { scopeCode } = useScope();

  const filteredPosts = useMemo(() => {
    if (!posts?.length) return [];

    const counties = Array.isArray(countiesData) ? countiesData : countiesData.counties;

    // 🔍 Identify scope type
    const currentCounty = counties.find((c) => c.countyCode === scopeCode);
    const currentConstituency = counties
      .flatMap((c) => c.constituencies)
      .find((ct) => ct.code === scopeCode);
    const currentWard = counties
      .flatMap((c) => c.constituencies.flatMap((ct: any) => ct.wards))
      .find((w) => w.code === scopeCode);

    // ✅ Filtering logic
    return posts.filter((p) => {
      if (scopeCode === 0) return true;

      // 🏛 County level
      if (currentCounty) {
        const constituencyCodes =
          currentCounty.constituencies?.map((ct: any) => ct.code) || [];
        const wardCodes =
          currentCounty.constituencies?.flatMap(
            (ct: any) => ct.wards?.map((w: any) => w.code) || []
          ) || [];
        return (
          p.scopeCode === currentCounty.countyCode ||
          constituencyCodes.includes(p.scopeCode) ||
          wardCodes.includes(p.scopeCode)
        );
      }

      // 🏘 Constituency level
      if (currentConstituency) {
        const wardCodes =
          currentConstituency.wards?.map((w: any) => w.code) || [];
        return (
          p.scopeCode === currentConstituency.code ||
          wardCodes.includes(p.scopeCode)
        );
      }

      // 🧱 Ward level
      if (currentWard) {
        return p.scopeCode === scopeCode;
      }

      return false;
    });
  }, [posts, scopeCode]);

  return (
    <div className="space-y-2 pb-20">
      {filteredPosts.map((post) => (
        <Post key={String(post._id)} post={post} />
      ))}
    </div>
  );
}

export default PostFeed;
