"use client"
import { IPostDocument } from "@/mongodb/models/post";
import Post from "./Post";
import { useScope } from "@/app/context/ScopeContext";

 function PostFeed({ posts }: { posts: IPostDocument[] }) {
  const { scope, setScope } = useScope();



  return (
    <div className="space-y-2 pb-20">
      {posts
        .filter((p) => p.scope === scope)
        .map((post) => (
          <Post key={String(post._id)} post={post} />
        ))}

    </div>
  );
}

export default PostFeed;
