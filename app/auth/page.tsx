// app/auth/page.tsx
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import z from "zod";
import countyData from "../../counties.json";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "sonner";
import createProfileAction from "../actions/profile";

const inputSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  nickName: z.string().nonempty("Nickname is required"),
  Category: z.string().nonempty("Category is required"),
  County: z.string().nonempty("County is required"),
  Constituency: z.string().nonempty("Constituency is required"),
  Ward: z.string().nonempty("Ward is required"),
   imageUrl: z.string().url().optional(), 
  acceptedTerms: z.literal(true, {
    message: "You must accept the terms",
  }),
});

type Ward = { name: string; code: number };
type Constituency = { name: string; code: number; wards: Ward[] };
type County = { name: string; countyCode: number; constituencies: Constituency[] };
// type userSession = {
//   session: Session | null;
// }
 

function FormPage() {
  // Dropdown states
  const [Category, setSelectedCategory] = useState<string>("Select Category");
  const [County, setSelectedCounty] = useState<string>("Select County");
  const [Constituency, setSelectedConstituency] = useState<string>("Select Constituency");
  const [Ward, setSelectedWard] = useState<string>("Select Ward");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Data states
  const [counties, setCounties] = useState<County[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Image preview
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // checkbox
const [acceptedTerms, setAcceptedTerms] = useState(false);

  // profile
  const [file, setFile] = useState<File | null>(null);

const router = useRouter();
const user = useUser();


  // Load counties
  useEffect(() => {
    if (countyData && countyData.counties) {
      setCounties(countyData.counties);
    }
  }, []);

  // Update constituencies when county changes
  useEffect(() => {
    const countyObj = counties.find((c) => c.name === County);
    if (countyObj) {
      setConstituencies(countyObj.constituencies);
    } else {
      setConstituencies([]);
      setSelectedConstituency("Select Constituency");
      setSelectedWard("Select Ward");
    }
  }, [County, counties]);

  // Update wards when constituency changes
  useEffect(() => {
    const constituencyObj = constituencies.find((c) => c.name === Constituency);
    if (constituencyObj) {
      setWards(constituencyObj.wards);
    } else {
      setWards([]);
      setSelectedWard("Select Ward");
    }
  }, [Constituency, constituencies]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target?.files?.[0];
    if (selectedFile) {
       setFile(selectedFile); // 👈 now used
      setPreview(URL.createObjectURL(selectedFile));
    }
  };


  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // ✅ Start loading

    try {
      let imageUrl = user?.user?.imageUrl ?? "";

      // 🖼️ Upload image if present
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "broadcast");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dmzw85kqr/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        imageUrl = data.secure_url;
      }

      // 🧾 Collect form data
      const form = e.target as HTMLFormElement;
      const formData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        nickName: form.nickName.value,
        Category,
        County,
        Constituency,
        Ward,
        acceptedTerms,
        imageUrl,
      };

      const result = inputSchema.safeParse(formData);
      if (!result.success) {
        alert("Please fill all fields correctly");
        return;
      }

      // 🚀 Send to backend
      await createProfileAction(formData);
      router.replace("/");
    } catch (err) {
      console.error("Profile creation failed:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false); // ✅ End loading
    }
  };

  return (
    <div>
      <Toaster />
      <div className="h-screen max-w-7xl mx-auto flex justify-center">
        <div className="w-full min-h-screen rounded-lg dark:border-gray-700 flex-grow max-w-2xl">
          
          <form onSubmit={handleSubmit} className="relative mt-4 p-8 space-y-6">
            {/* First Name */}
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <label className="w-28">First Name:</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter name"
                className="border border-gray-300 bg-transparent rounded-md  w-full sm:w-[400px]"
                required
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <label className="w-28">Last Name:</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                className="border border-gray-300 bg-transparent rounded-md w-full sm:w-[400px]"
                required
              />
            </div>

            {/* Nickname */}
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <label className="w-28">NickName:</label>
              <input
                type="text"
                name="nickName"
                placeholder="Enter nickname"
                className="border border-gray-300 bg-transparent rounded-md w-full sm:w-[400px]"
                required
              />
            </div>

            {/* Profile Image */}
            <div>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="mr-2" /> Upload Profile<span>/optional</span>
              </Button>
              
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={handleImageChange}
              />
              {preview && <img src={preview} alt="preview" className="h-16 w-16 rounded-md mt-2" />}
            </div>
        <div className="flex flex-col justify-self-start space-y-2">
               {/* Category Dropdown */}
            <Popover>
              <PopoverTrigger className="border-[1px] p-2 rounded-lg flex justify-start"  onClick={() => setOpen(!open)}>{Category}</PopoverTrigger>
              <PopoverContent className="flex flex-col space-y-1 bg-gray-100 dark:bg-gray-900 ">
                {[
                  "Personal Account",
                  "Business Account",
                  "Non-Profit and Community Account",
                  "Public Figure Account",
                  "Media and Publisher Account",
                  "News and Media Outlet",
                  "E-commerce and Retail Account",
                  "Entertainment and Event Account",
                ].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {setSelectedCategory(cat); setOpen(false);}}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 px-2"
                  >
                    {cat}
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* County Dropdown */}
            <Popover>
              <PopoverTrigger className="border-[1px] p-2 rounded-lg flex justify-start"  onClick={() => setOpen(!open)}>{County}</PopoverTrigger>
              <PopoverContent className="flex flex-col space-y-1  max-h-56 overflow-y-scroll bg-gray-100 dark:bg-gray-900 ">
                {counties.map((county) => (
                  <div
                    key={`{county.countyCode}-${county.name}`}
                    onClick={() => {
                      setSelectedCounty(county.name);
                      setSelectedConstituency("Select Constituency");
                      setSelectedWard("Select Ward");
                      setOpen(false);
                    }}
                    className="cursor-pointer px-2 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    {county.name}
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* Constituency Dropdown */}
            <Popover>
              <PopoverTrigger className="border-[1px] p-2 rounded-lg flex justify-start"  onClick={() => setOpen(!open)}>{Constituency}</PopoverTrigger>
              <PopoverContent className="flex flex-col space-y-1 bg-gray-100 dark:bg-gray-900 ">
                {constituencies.map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                        setSelectedConstituency(c.name);
                        setSelectedWard("Select Ward");
                        setOpen(false);
                      }}

                    className="cursor-pointer px-2 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    {c.name}
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* Ward Dropdown */}
            <Popover>
              <PopoverTrigger className="border-[1px] p-2 rounded-lg flex justify-start"  onClick={() => setOpen(!open)}>{Ward}</PopoverTrigger>
              <PopoverContent className="flex flex-col space-y-1 bg-gray-100 dark:bg-gray-900 ">
                {wards.map((w) => (
                  <div
                    key={w.code}
                    onClick={() => {
                        setSelectedWard(w.name);
                        setOpen(false);
                      }}

                    className="cursor-pointer px-2 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    {w.name}
                  </div>
                ))}
              </PopoverContent>
            </Popover> 
</div>


            {/* Terms */}
            <div className="flex items-center space-x-2">
  <input
    type="checkbox"
    name="acceptedTerms"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
  />
  <span>Accept terms</span>
</div>

            {/* Submit */}
            <Button type="submit" variant="outline">{loading ? "loading..." :"Submit"}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormPage;
