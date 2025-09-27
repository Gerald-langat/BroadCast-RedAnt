"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, PlusIcon, SmilePlus } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useScope } from "@/app/context/ScopeContext";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { IProfileBase } from "./../mongodb/models/profile";
import { submitCastAction } from "@/app/actions/submitCastAction";
import EmojiPicker from "emoji-picker-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";



function PostForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [statusPreview, setStatusPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingCast, setLoadingCast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileStatusInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLFormElement>(null);
  const { scope, setScope } = useScope();
  const { user } = useUser();
  const [sFile, setSFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState("");
  const [status, setStatus] = useState<any[]>([]);
  const [profile, setProfile] = useState<IProfileBase | null>(null);
  const [showPicker, setShowPicker] = useState(false);


  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch status");

      const data = await res.json();

      // 1. Filter by scope = "status"
      const filtered = data.filter((post: any) => post.scope === "status");

      // 2. Keep only the first status per userId
      const uniqueByUser = filtered.filter(
        (post: any, index: number, self: any[]) =>
          index === self.findIndex((p) => p.userId === post.userId)
      );

      setStatus(uniqueByUser);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, []);



  // Handle cast image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Handle status image
  const handleStatusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSFile(selectedFile);
      setStatusPreview(URL.createObjectURL(selectedFile));
    }
  };


  // Generic submit function
// PostForm.tsx (inside handleSubmit)
const handleSubmit = async (
  submitAction: (cast: string, imageUrl?: string, scope?: string) => Promise<any>,
  isStatus = false,
  selectedScope?: string,
  onSuccess?: (newCast: any) => void
) => {
  try {
    if (isStatus) setLoadingStatus(true);
    else setLoadingCast(true);

    const castText = isStatus ? statusText : ref.current?.cast?.value || "";
    if (!castText.trim()) {
      toast.error("Cannot submit empty cast");
      return;
    }

    let imageUrl = "";
    const uploadFile = isStatus ? sFile : file;

    // Upload image if present
    if (uploadFile) {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("upload_preset", "broadcast");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dmzw85kqr/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      imageUrl = data.secure_url;
    }

    // Use selectedScope if provided; fallback to current scope
    const castScope = selectedScope || scope;

    // Call the submit action
    const newCast = await submitAction(castText, imageUrl, castScope);

    if (onSuccess) onSuccess(newCast);

    toast.success("Posted successfully");

    // Reset form
    ref.current?.reset();
    setPreview(null);
    setFile(null);
    setStatusPreview(null);
    setStatusText("");
    setSFile(null);
  } catch (err) {
    console.error("Failed to submit cast:", err);
    toast.error("Failed to submit cast");
  } finally {
    if (isStatus) setLoadingStatus(false);
    else setLoadingCast(false);
  }
};

  if (loading)
    return (
      <p className="w-full md:px-4 xl:max-w-2xl min-h-screen">
        <span className="loading loading-bars loading-md"></span>
      </p>
    );

  return (
    <div className="">
      <div className="flex items-center space-x-2 border-[1px] p-2 rounded-b-md">        
 <Dialog>
  <DialogTrigger asChild>
    <button className="border-[1px] w-fit rounded-full p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Plus size={24} />
          </TooltipTrigger>
          <TooltipContent className="dark:bg-gray-900">
            <p>Add status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Status</DialogTitle>
    </DialogHeader>

    {/* Status Input */}
    <textarea
      value={statusText}
      onChange={(e) => setStatusText(e.target.value)}
      placeholder="Add status..."
      className="w-full border rounded-md p-2 bg-transparent"
    />

    {/* Status Image Preview */}
    {statusPreview && (
      <img
        src={statusPreview}
        alt="status preview"
        className="h-24 w-24 rounded-md mt-2"
      />
    )}

    <DialogFooter>
      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Upload image */}
        <ImageIcon size={20} onClick={() => fileStatusInputRef.current?.click()} />
        <input
          type="file"
          accept="image/*"
          ref={fileStatusInputRef}
          hidden
          onChange={handleStatusImageChange}
        />

        {/* Emoji picker */}
        <button type="button" onClick={() => setShowPicker(!showPicker)}>
          <SmilePlus size={20} />
        </button>
        <div className="relative">
          {showPicker && (
            <div className="absolute z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setStatusText((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>

      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button
          disabled={loadingStatus}
          onClick={() => handleSubmit(submitCastAction, true, "status")}
        >
          {loadingStatus ? "Sending..." : "Send"}
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>

<div className="flex space-x-2 max-w-full overflow-x-auto scrollbar-hide">
  {status.map((s, idx) => (
    <Link
    href={`status`}
      key={idx}
      className="flex items-center justify-center rounded-full p-1 border-2 w-12 h-12 shrink-0 cursor-pointer"
    >
      {s.imageUrl ? (
        <Image
          src={s.imageUrl || "/logo/broadcast.jpg"}
          width={48}
          height={48}
          alt="status-image"
          className="rounded-full object-cover w-10 h-10"
        />
      ) : (
        <p className="text-[10px] text-center">{s.cast}</p>
      )}
    </Link>
  ))}
</div>


      </div>

      {/* Cast Form */}
      <div className="border-[1px] p-2 rounded-md">
        <form className="space-y-2" ref={ref}>
          <div className="flex w-full space-x-2">
            <Image
              src={profile?.userImg || "/logo/Broadcast.jpg"}
              width={200}
              height={200}
              alt="my prof"
              className="w-12 h-12 rounded-xl"
              priority
            />
            <textarea
              required
              name="cast"
              className="flex-grow h-12  bg-transparent "
              placeholder="type here..."
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="h-24 w-24 rounded-md mt-2"
            />
          )}

          <div className="flex w-full justify-between">
            <div className="flex items-center space-x-3">
              <ImageIcon
                size={20}
                onClick={() => fileInputRef.current?.click()}
              />
              <button onClick={() => setShowPicker(!showPicker)}>
                  <SmilePlus size={20} />
                </button>
              <div className="relative">
               {showPicker && (
                <div className="absolute z-50 w-16 h-10">
                  <EmojiPicker
                    onEmojiClick={(emojiData, event) => {
                      const textarea = ref.current?.cast
                      if (textarea) {
                        textarea.value += emojiData.emoji // 👈 correct field
                        textarea.focus()
                      }
                    }}
                  />
                </div>
              )}

              </div>
            </div>

            {/* Scope Buttons */}
            <div className="space-x-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">County</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Cast to County</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        disabled={loadingCast}
                        onClick={() =>
                          handleSubmit(submitCastAction, false, profile?.county)
                        }
                      >
                        {loadingCast ? "Sending..." : "Send"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Constituency</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Cast to Constituency</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        disabled={loadingCast}
                        onClick={() =>
                          handleSubmit(submitCastAction, false, profile?.constituency)
                        }
                      >
                        {loadingCast ? "Sending..." : "Send"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Ward</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Cast to Ward</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        disabled={loadingCast}
                        onClick={() =>
                          handleSubmit(submitCastAction, false, profile?.ward)
                        }
                      >
                        {loadingCast ? "Sending..." : "Send"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Cast</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Cast</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        disabled={loadingCast}
                        onClick={() => handleSubmit(submitCastAction, false)}
                      >
                        {loadingCast ? "Sending..." : "Send"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;
