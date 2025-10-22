"use client";

import useSWR from "swr";
import { IProfileBase } from "@/mongodb/models/profile";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<IProfileBase>("/api/profile", fetcher, {
    revalidateOnFocus: false, // Optional: don't refetch every time the tab focuses
    dedupingInterval: 60000,  // Optional: cache for 1 min
  });

  return {
    profile: data || null,
    loadingProfile: isLoading,
    error: error ? error.message : null,
    mutate, // optional: allows manual refetch after update
  };
}
