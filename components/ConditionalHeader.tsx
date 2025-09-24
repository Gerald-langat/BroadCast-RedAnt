// app/components/ConditionalHeader.tsx
"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // List of folders or routes where Header should NOT appear
  const excludedPaths = ["/auth", "/profile", "/settings", "/dashboard"];

  // Check if pathname starts with any excluded prefix
  const hideHeader = excludedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (hideHeader) return null;

  return <Header />;
}
