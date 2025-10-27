"use client"

import { Chat } from "stream-chat-react"
import streamClient from "@/lib/stream";
import Link from "next/link";
import {   SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import "stream-chat-react/dist/css/v2/index.css";
import { useTheme } from "next-themes";


function Layout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme(); // from shadcn
  const isDark = theme === "dark";

    return (
     

        <Chat client={streamClient}
         theme={isDark ? "str-chat__theme-dark" : "str-chat__theme-light"}>
          <SidebarProvider>
             <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4 dark:bg-black">
                       <SidebarTrigger className="-ml-1" />
                       <Separator 
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                       />
                       <Link href="/dashboard">
                          <h1>Broadcast</h1>
                       </Link>
                    </header>
                    <div className="dark:bg-black">
                        {children}
                    </div>
                </SidebarInset>
          </SidebarProvider>
        </Chat>
      

    )
}

export default Layout;