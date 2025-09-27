"use client";
import { IPostDocument } from "@/mongodb/models/post";
import { useScope } from "@/app/context/ScopeContext";
import Image from "next/image";
import Link from "next/link";

function MediaFeed({ posts }: { posts: IPostDocument[] }) {
  const { scope } = useScope();

  return (
    <div className="space-y-2 pb-20 max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
      {posts
        .filter((p) => p.scope === scope)
        .filter((p) => p.imageUrl) // only posts with image
        .map((post) => (
          <Link href={`profile/${post.user.userId}`} key={String(post._id)} className="flex flex-col items-center">
            <Image
              src={post.imageUrl || "/logo/broadcast.jpg"}
              width={200}
              height={200}
              alt="post image"
              className="rounded-lg object-cover"
            />
            <div className="flex items-center gap-2">
                <p className="font-semibold">{post.user?.firstName}</p>
                <p className="text-gray-500">{post.user?.lastName}</p>
                <p className="text-gray-500">@{post.user?.nickName}</p>  
            </div>
          </Link>
        ))}
    </div>
  );
}

export default MediaFeed;
