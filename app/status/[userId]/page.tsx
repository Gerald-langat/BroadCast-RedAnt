"use client";

import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IPostDocument } from "@/mongodb/models/statusPost";
import deleteStatusAction from "@/app/actions/deleteStatusAction";

export default function Page() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [status, setStatus] = useState<IPostDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();
  const router = useRouter();

  // Fetch statuses for user
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/statusPosts?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStatus(data);
        } else if (data && Array.isArray(data.posts)) {
          setStatus(data.posts);
        } else if (data && typeof data === "object") {
          setStatus([data]);
        } else {
          setStatus([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setStatus([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Auto-progress bar + auto-next
  useEffect(() => {
    if (!status.length || loading) return;

    if (timerRef.current) clearInterval(timerRef.current);

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentIndex < status.length - 1) {
              setCurrentIndex((prevIndex) => prevIndex + 1);
              return 0;
            } else {
              clearInterval(timerRef.current!);
              router.back(); // reached the end
              return 100;
            }
          }
          return prev + 2; // controls speed (100/2 = ~5s)
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentIndex, loading, isPaused]);

  const handleNext = () => {
    if (currentIndex < status.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const pauseOrResume = () => {
    setIsPaused((prev) => !prev);
  };

  if (loading) return  <p className="max-w-6xl mx-auto justify-center min-h-screen items-center">Loading...</p>;
  if (status.length === 0) return <p>No status found for this user.</p>;

  const currentStatus = status[currentIndex];

  const author = currentStatus?.user?.userId === user?.id;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black text-white">
      {/* Progress bar */}
      <div className="absolute top-1 left-0 w-full h-1 bg-gray-700 z-40">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Prev / Next controls */}
      <div
        className="absolute left-0 top-0 w-1/6 h-full flex justify-center items-center z-50"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-10 w-10 text-white cursor-pointer" />
      </div>
      <div
        className="absolute right-0 top-0 w-1/6 h-full flex justify-center items-center z-50"
        onClick={handleNext}
      >
        <ChevronRight className="h-10 w-10 text-white cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center w-full py-6">
        {currentStatus?.videoUrl? (
          <video
            src={currentStatus.videoUrl}
            muted
            controls
            className="object-contain w-[60%] max-h-[80vh]"
            onEnded={handleNext}
          />
        ) : currentStatus?.imageUrls?.length === 1 ? (
          <img
            src={currentStatus.imageUrls[0]}
            alt="Status"
            className="max-h-[80vh] object-contain"
          />
        ) : (
         null
        )}

        {currentStatus?.cast && (
          <div className="mt-2 text-lg font-semibold text-center">
            <p className="px-3 py-1 rounded-md inline-block break-words max-w-full">
              {currentStatus.cast}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 flex space-x-3">
          {author && (
            <button
              onClick={() => {deleteStatusAction(String(currentStatus._id))}}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          )}
          {!currentStatus?.videoUrl && (
            <button
              onClick={pauseOrResume}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
