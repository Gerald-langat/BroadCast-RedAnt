"use client";
import {  IProfileBase } from "@/mongodb/models/profile";
import { useEffect, useState } from "react";



export function useProfile() {
  const [profile, setProfile] = useState<IProfileBase | null>(null);
  const [loadingProfile, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loadingProfile, error };
}
