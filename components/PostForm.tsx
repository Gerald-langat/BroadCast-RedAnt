"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, SmilePlus } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
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
import { toast } from "sonner";
import { IProfileBase } from "./../mongodb/models/profile";
import { submitCastAction } from "@/app/actions/submitCastAction";
import EmojiPicker from "emoji-picker-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { submitStatusAction } from "@/app/actions/submitStatusAction";
import { IPostBase } from "@/mongodb/models/statusPost";


 function PostForm({ user }: { user: IProfileBase }) {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [statusPreview, setStatusPreview] = useState<string[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingCast, setLoadingCast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileStatusInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLFormElement>(null);
  const { scopeCode, scope } = useScope();
  const [sFiles, setSFiles] = useState<File[]>([]);
  const [statusText, setStatusText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
   const closeRef = useRef<HTMLButtonElement>(null);


const fetcher = (url: string) => fetch(url).then((res) => res.json());
const { data: status = [], isLoading, mutate } = useSWR<IPostBase[]>("/api/statusPosts", fetcher);

useEffect(() => {
  if (mutate) mutate();
}, [mutate]);

// ✅ Remove duplicate users (keep the latest one)
const uniqueStatus = (status as IPostBase[]).filter(
  (post, index, self) =>
    index === self.findIndex((p) => p.user.userId === post.user.userId)
);

  // handle multiple files
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...filesArray]); // keep files
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreview((prev) => [...prev, ...newPreviews]); // preview
    }
  };


  // Handle status image
 const handleStatusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSFiles((prev) => [...prev, ...filesArray]); // keep files
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setStatusPreview((prev) => [...prev, ...newPreviews]); // preview
    }
  };


  // Generic submit function
const handleSubmit = async (
  submitAction: (
    cast: string,
    scope: string,
    scopeCode: number,
    imageUrls?: string[],
    videoUrl?: string
  ) => Promise<any>,
  selectedScope?: string,
  selectedScopeCode?: number,
  onSuccess?: (newCast: any) => void
) => {
  try {
     setLoadingCast(true);

    const castText =  ref.current?.cast?.value || "";
    if (!castText.trim()) {
      toast.error("Cannot submit empty cast");
      return;
    }

    let imageUrls: string[] = [];
    let videoUrl: string | undefined;

    const filesToUpload = Array.isArray(files) ? files : [files].filter(Boolean);

    for (const f of filesToUpload.slice(0, 4)) {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("upload_preset", "broadcast");
      const uploadType = f.type.startsWith("video/") ? "video" : "image";

      const res = await fetch(`https://api.cloudinary.com/v1_1/dmzw85kqr/${uploadType}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (f.type.startsWith("video/")) videoUrl = data.secure_url;
      else imageUrls.push(data.secure_url);
    }

    // Fallback to context values if none selected
    const castScope = selectedScope ?? scope;
    const castScopeCode = selectedScopeCode ?? scopeCode;

    const newCast = await submitAction(castText, castScope, castScopeCode, imageUrls, videoUrl);


    onSuccess?.(newCast);
    toast.success("Posted successfully");

    // Reset
    ref.current?.reset();
    setPreview([]);
    setFiles([]);
  } catch (err) {
    console.error("Failed to submit cast:", err);
    toast.error("Failed to submit cast");
  } finally {
   setLoadingCast(false);
  }
    closeRef.current?.click();
};

// Generic submit function for status
const handleSubmitStatus = async (
  submitStatusAction: (
    cast: string,
    imageUrls?: string[],
    videoUrl?: string
  ) => Promise<any>,
  onSuccess?: (newCast: any) => void
) => {
  try {
     setLoadingStatus(true);

    const castText =  statusText;
    if (!castText.trim()) {
      toast.error("Cannot submit empty cast");
      return;
    }

    let imageUrls: string[] = [];
    let videoUrl: string | undefined;

    const filesToUpload = Array.isArray(files) ? sFiles : [files].filter(Boolean);

    for (const f of filesToUpload.slice(0, 4)) {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("upload_preset", "broadcast");
      const uploadType = f.type.startsWith("video/") ? "video" : "image";

      const res = await fetch(`https://api.cloudinary.com/v1_1/dmzw85kqr/${uploadType}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (f.type.startsWith("video/")) videoUrl = data.secure_url;
      else imageUrls.push(data.secure_url);
    }

    const newCast = await submitStatusAction(castText, imageUrls, videoUrl);


    onSuccess?.(newCast);
    toast.success("Posted successfully");

    // Refresh status list
    if (mutate) await mutate();

    // Reset
    ref.current?.reset();
    setSFiles([]);
    setStatusPreview([]);
    setStatusText("");
  } catch (err) {
    console.error("Failed to submit cast:", err);
    toast.error("Failed to submit cast");
  } finally {
   setLoadingStatus(false);
  }
    closeRef.current?.click();
};



  return (
    <div>
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
      className="w-full border-b-[1px] rounded-md p-2 bg-transparent focus:ring-0 focus:outline-none"
      onClick={() => setShowPicker(false)}
    />

    {/* Status Image Preview */}
      {statusPreview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {sFiles.map((f, idx) =>
              f.type.startsWith("video/") ? (
                <video
                  key={idx}
                  src={statusPreview[idx]}
                  className="h-24 w-24 rounded-md object-cover"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  key={idx}
                  src={statusPreview[idx]}
                  alt={`preview-${idx}`}
                  className="h-24 w-24 rounded-md object-cover"
                />
              )
            )}
          </div>
        )}

    <DialogFooter>
      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Upload image */}
        <ImageIcon size={20} onClick={() => fileStatusInputRef.current?.click()} />
        <input
          type="file"
          accept="image/*,video/*"
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
            {/* Hidden close button used for programmatic close */}
            <button ref={closeRef} className="hidden" />
          </DialogClose>
        <Button
          disabled={loadingStatus}
          onClick={() => handleSubmitStatus(submitStatusAction)}
        >
          {loadingStatus ? "Sending..." : "Send"}
        </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<div className="flex space-x-2 max-w-full overflow-x-auto scrollbar-hide">
  {isLoading && <p>Loading statuses...</p>}
{uniqueStatus.map((s: any, idx: any) => (
  <Link
    href={`status/${s.user.userId}`}
    key={idx}
    className="flex items-center justify-center rounded-full p-1 border-2 w-12 h-12 shrink-0 cursor-pointer"
  >
    {s.imageUrls && s.imageUrls.length > 0 ? (
      <Image
        src={s.imageUrls[0] || "/logo/broadcast.jpg"}
        width={48}
        height={48}
        alt="status-image"
        className="rounded-full object-cover w-10 h-9"
      />
    ) : s.videoUrl ? (
      <video
        src={s.videoUrl || "/logo/broadcast.jpg"}
        width={48}
        height={48}
        className="rounded-full object-cover w-10 h-9"
      />
    ) : (
      <p className="text-[10px] text-center">{s.cast}</p>
    )}
  </Link>
))}

</div>
      </div>
        <div className="border-[1px] p-2 rounded-md">
        <form className="space-y-2" ref={ref}>
          <div className="flex w-full space-x-2">
            <Image
              src={user?.userImg || "/logo/Broadcast.jpg"}
              width={200}
              height={200}
              alt="my prof"
              className="w-12 h-12 rounded-xl"
              priority
            />
            <textarea
              required
              name="cast"
              className="w-full border-b-[1px] rounded-md p-2 bg-transparent focus:ring-0 focus:outline-none"
              placeholder="type here..."
              onClick={() => setShowPicker(false)}
            />
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </div>

               {preview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {files.map((f, idx) =>
              f.type.startsWith("video/") ? (
                <video
                  key={idx}
                  src={preview[idx]}
                  className="h-24 w-24 rounded-md object-cover"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  key={idx}
                  src={preview[idx]}
                  alt={`preview-${idx}`}
                  className="h-24 w-24 rounded-md object-cover"
                />
              )
            )}
          </div>
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
            {/* Hidden close button used for programmatic close */}
            <button ref={closeRef} className="hidden" />
          </DialogClose>
                      <Button
                          disabled={loadingCast}
                          onClick={() =>
                            handleSubmit(
                              submitCastAction,
                              user?.county,
                              user?.countyCode
                            )
                          }
                        >
                          {loadingCast ? "Sending..." : "Send"}
                        </Button>
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
            {/* Hidden close button used for programmatic close */}
            <button ref={closeRef} className="hidden" />
          </DialogClose>
                     <Button
                      disabled={loadingCast}
                      onClick={() =>
                        handleSubmit(
                          submitCastAction,
                          user?.constituency,
                          user?.constituencyCode
                        )
                      }
                    >
                      {loadingCast ? "Sending..." : "Send"}
                    </Button>
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
            {/* Hidden close button used for programmatic close */}
            <button ref={closeRef} className="hidden" />
          </DialogClose>
                      <Button
                        disabled={loadingCast}
                        onClick={() =>
                          handleSubmit(
                            submitCastAction,
                            user?.ward,
                            user?.wardCode
                          )
                        }
                      >
                        {loadingCast ? "Sending..." : "Send"}
                      </Button>
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
            {/* Hidden close button used for programmatic close */}
            <button ref={closeRef} className="hidden" />
          </DialogClose>
                      <Button
                          disabled={loadingCast}
                          onClick={() =>
                            handleSubmit(
                              submitCastAction,
                              scope ?? "Home",
                              scopeCode ?? 0
                            )
                          }
                        >
                          {loadingCast ? "Sending..." : "Send"}
                        </Button>
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
