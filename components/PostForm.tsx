"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, PlusIcon, SmilePlus } from "lucide-react";
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
      <h2 className="border-[1px] p-2 rounded-b-md">{scope || "Home"}</h2>

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
              <SmilePlus size={20} />
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
