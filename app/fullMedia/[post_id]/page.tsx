"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import CommentFeed from "@/components/CommentFeed";
import { IPostDocument } from "@/mongodb/models/post";
import Image from "next/image";

export default function FullMediaPage() {
  const { post_id } = useParams();
  const [post, setPost] = useState<IPostDocument | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch post function
const fetchPost = useCallback(async () => {
  if (!post_id) return;

  try {
    const res = await fetch(`/api/posts/${post_id}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const data = await res.json();
    setPost(data);
  } catch (err) {
    console.error(err);
  }
}, [post_id]);


  // Load post
useEffect(() => {
  fetchPost();
}, [fetchPost]);


  // Pause video when out of view
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [videoRef]);

  // ✅ Safe to return after hooks
  if (!post) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="w-full md:flex space-x-6 mt-6 px-4">
      {/* Post Text */}
      <div>
        {post.cast && <p className="mb-4">{post.cast}</p>}

        {/* Images */}
        {post.imageUrls && post.imageUrls.length === 1 ? (
          <Image
            src={post.imageUrls[0]}
            alt="Post Image"
            className="w-full mx-auto rounded-lg"
          />
        ) : post.imageUrls && post.imageUrls.length > 1 ? (
          <div className="grid grid-cols-2 gap-2">
            {post.imageUrls.map((url: string, idx: number) => (
              <Image
                key={idx}
                src={url}
                alt={`Post Image ${idx + 1}`}
                className="w-full h-96 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : post.videoUrl ? (
          <video
            ref={videoRef}
            src={post.videoUrl}
            controls
            muted
            playsInline
            className="w-full h-72 rounded-lg"
          />
        ) : null}
      </div>

      <div>
        <div className="p-4">
          <CommentForm postId={post_id as string} />
          <CommentFeed postId={post_id as string} />
        </div>
      </div>
    </div>
  );
}
