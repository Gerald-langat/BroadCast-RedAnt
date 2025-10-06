"use client";

import { submitCastAction } from "@/app/actions/submitMarketAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IPostDocument } from "@/mongodb/models/marketpost";
import { useUser } from "@clerk/nextjs";
import { ImageIcon, MessageCircleMore, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useChatContext } from "stream-chat-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function MarketFeed({ posts }: { posts: IPostDocument[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [productName, setProductName] = useState("");
  const [cost, setCost] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const { client, setActiveChannel } = useChatContext();
  const router = useRouter();
  const {user} = useUser()

const handleStartChat = async (targetUserId: string) => {
  // Make sure the chat client and user are loaded
  if (!client || !client.user || !client.user.id) {
    console.error("Chat client not ready or user not connected");
    return;
  }

  try {
    const newChannel = client.channel("messaging", undefined, {
      members: [client.user.id, targetUserId],
    });

    await newChannel.watch();
    setActiveChannel(newChannel);

    router.push(`/dashboard/chat/${newChannel.id}`);
  } catch (error) {
    console.error("Error starting chat:", error);
  }
};

  // handle multiple files
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreview((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async (
  submitAction: (
    description: string,
    cost: number, 
    productName: string,
    imageUrls?: string[],
    videoUrl?: string,
  ) => Promise<any>,
  onSuccess?: (newCast: any) => void
) => {
  try {
    setLoadingStatus(true);

    const desc = description.trim();
    if (!desc) {
      toast.error("Cannot submit empty description");
      return;
    }

    let imageUrls: string[] = [];
    let videoUrl: string | undefined;

    for (const f of files.slice(0, 4)) {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("upload_preset", "broadcast");

      const isVideo = f.type.startsWith("video/");
      const uploadType = isVideo ? "video" : "image";

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dmzw85kqr/${uploadType}/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (isVideo) videoUrl = data.secure_url;
      else imageUrls.push(data.secure_url);
    }

    const newCast = await submitAction(desc, cost, productName, imageUrls, videoUrl);
    if (onSuccess) onSuccess(newCast);

    toast.success("Posted successfully");

    ref.current?.reset();
    setPreview([]);
    setFiles([]);
    setDescription("");
    setCost(0);
    setProductName("");
  } catch (err) {
    console.error("Failed to submit:", err);
    toast.error("Failed to submit post");
  } finally {
    setLoadingStatus(false);
  }
};



  if (loadingStatus)
    return (
      <p className="w-full flex justify-center items-center min-h-screen">
        <span className="loading loading-bars loading-md"></span>
      </p>
    );

  return (
    <div>
      <div className="flex justify-between items-center max-w-6xl mx-auto py-4 px-2">
        <p className="font-semibold text-lg">Categories</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Sell</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell Form</DialogTitle>
            </DialogHeader>

            <form ref={ref} className="space-y-3">
              <input
                type="text"
                required
                placeholder="product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full border rounded-md p-2 bg-transparent"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add product description..."
                className="w-full border rounded-md p-2 bg-transparent"
              />
              <input
                type="number"
                required
                placeholder="Enter amount"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : 0)}
                className="w-full border rounded-md p-2 bg-transparent"
              />

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
            </form>

            <DialogFooter>
              <div className="flex items-center space-x-3">
                <ImageIcon
                  size={20}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  hidden
                  onChange={handleImageChange}
                />
              </div>

              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                disabled={loadingStatus}
                onClick={() => handleSubmit(submitCastAction)}
              >
                {loadingStatus ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* ✅ Product Grid */}
      <div className="max-w-6xl mx-auto py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div key={String(post._id)} className="card bg-base-100 shadow-sm">
            <figure className="h-40">
              <img
                src={
                  post.imageUrls?.[0] ||
                  "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                }
                alt={post.productName}
                className="object-cover w-full h-full rounded-md"
              />
            </figure>
            <div className="card-body">
              <p className="font-semibold text-primary">Ksh {post.cost}</p>
              <h2 className="card-title">{post.productName}</h2>
              <p className="line-clamp-2 break-words">{post.description}</p>
              <div className="card-actions justify-end">
                <Button onClick={() => handleStartChat(post.user.userId)} className="border-[1px]">
                  <MessageCircleMore size={16} /> Chat
                </Button>
                <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="dark:bg-gray-800">
                      {user?.id === post.user.userId && (
                                  <div
                                    onClick={() => { deletePostAction(String(post._id))}}
                                  >
                                    <p className="text-red-600 cursor-pointer">Delete</p>
                                  </div>
                                )}         
                    </PopoverContent>
                  </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
