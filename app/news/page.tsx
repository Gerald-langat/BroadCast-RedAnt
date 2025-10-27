"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import { useScope } from "../context/ScopeContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function NewsPage() {
  const { data, error, isLoading } = useSWR("/api/news", fetcher);
    const videoRef = useRef<HTMLVideoElement | null>(null);
  const { scope } = useScope();

  useEffect(() => {
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
        { threshold: 0.5 } // 50% of the video must be visible
      );
  
      if (videoRef.current) {
        observer.observe(videoRef.current);
      }
  
      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
      };
    }, []);

  if (isLoading) return <p className="p-4">Loading news...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load news</p>;

  return (
    <div className="space-y-4 py-4">
      {data?.length === 0 ? (
        <p>No news posts available.</p>
      ) : (
        data
        .filter((dt: any) => dt.scope === scope)
        .map((newsItem: any) => (
          <div key={newsItem._id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg">{newsItem.cast}</h2>
            <p className="text-sm text-gray-500">#{newsItem.category}</p>
               <div>
                        {newsItem.imageUrls && newsItem.imageUrls.length === 1 ? (
                          <Link href={`fullMedia/${String(newsItem._id)}`}>
                            <img
                              src={newsItem.imageUrls[0]}
                              alt="Post Image"
                              className="w-full mx-auto"
                            />
                            </Link>
                        ) : newsItem.imageUrls && newsItem.imageUrls.length > 1 ? (
                          <Link href={`fullMedia/${String(newsItem._id)}`} className="grid grid-cols-2  gap-1">
                            {newsItem.imageUrls.map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Post Image ${idx + 1}`}
                                className="w-full h-48 mx-auto object-cover"
                              />
                            ))}
                          </Link>
                        ) : newsItem.videoUrl ? (
                          <video
                            ref={videoRef}
                            src={newsItem.videoUrl || ""}
                            controls
                            muted
                            playsInline
                            className="w-full h-60 mx-auto rounded-lg"
                          />
                        ) : null}
                  </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NewsPage;
