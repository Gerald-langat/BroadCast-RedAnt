"use client";
import { IPostDocument } from "@/mongodb/models/post";
import { useScope } from "@/app/context/ScopeContext";
import Link from "next/link";

function MediaFeed({ posts }: { posts: IPostDocument[] }) {
  const { scope } = useScope();

if(posts.length === 0) {
    return <div className=" max-w-4xl mx-auto justify-between min-h-screen items-center">No media available.</div>;
}

  return (
    <div className="pb-20 max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
  {posts
    .filter((p) => p.scope === scope)
    .filter((p) => (p.imageUrls && p.imageUrls.length > 0) || p.videoUrl)
    .map((post) => (
      <div key={String(post._id)} className="flex flex-col">
        <Link href={`fullMedia/${String(post._id)}`} className="block">
          {/* Single Image */}
          {post.imageUrls && post.imageUrls.length === 1 ? (
            <img
              src={post.imageUrls[0]}
              alt="Post Image"
              className="w-full h-48 object-cover rounded-lg" // ✅ same height for all
            />
          ) : post.imageUrls && post.imageUrls.length > 1 ? (
            <div className="grid grid-cols-2 gap-1 w-full h-48"> 
              {post.imageUrls.slice(0, 4).map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Post Image ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : post.videoUrl ? (
            <video
              src={post.videoUrl}
              muted
              playsInline
              className="w-full h-48 object-cover rounded-lg" // ✅ same height as images
            />
          ) : null}
        </Link>

        {/* User info */}
        <p className="mt-1 text-sm font-medium">
          {post.user.firstName} @{post.user.nickName}
        </p>
      </div>
    ))}
</div>

  );
}

export default MediaFeed;
