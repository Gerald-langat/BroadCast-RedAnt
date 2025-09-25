"use client";
import StatusCard from "@/components/StatusCard";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  CallingState,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { AlertTriangle, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { UserProfile } from "@/components/UserSyncWrapper";

if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
  throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
}

function Layout({ children }: { children: React.ReactNode }) {
  
  const { id } = useParams();
  const [call, setCall] = useState<Call | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: UserProfile = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }, []);
  // Memoize the Stream user
  const streamUser = useMemo(() => {
    if (!user?.userId) return null;

    return {
      id: user.userId,
      name:
        user.firstName,
        nickname: 
        user.nickName,
      image: user.imageUrl || "",
      type: "authenticated" as const,
    };
  }, [user]);

  // Stable tokenProvider
  const tokenProvider = useCallback(async () => {
    const res = await fetch("/api/stream/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.userId }),
    });
    if (!res.ok) throw new Error("Failed to fetch token");
    const { token } = await res.json();
    return token;
  }, [user?.userId]);

  // Create StreamVideoClient
  useEffect(() => {
    if (!streamUser) {
      setClient(null);
      return;
    }

    const newClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY as string,
      user: streamUser,
      tokenProvider,
    });

    setClient(newClient);

    return () => {
      newClient.disconnectUser().catch(console.error);
    };
  }, [streamUser, tokenProvider]);

  // Join a call
  useEffect(() => {
    if (!client || !id) return;

    setError(null);

    const streamCall = client.call("default", id as string);

    const joinCall = async () => {
      try {
        await streamCall.join({ create: true });
        setCall(streamCall);
      } catch (error) {
        console.error("Failed to join call", error);
        setError(
          error instanceof Error ? error.message : "Failed to join call"
        );
      }
    };

    joinCall();

    return () => {
      if (streamCall.state.callingState === CallingState.JOINED) {
        streamCall.leave().catch(console.error);
      }
    };
  }, [id, client]);

  // Error state
  if (error) {
    return (
      <StatusCard
        title="Call Error"
        description={error}
        className="min-h-screen bg-red-50"
        action={
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors
                    duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        }
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </StatusCard>
    );
  }

  // Client not ready
  if (!client) {
    return (
      <StatusCard
        title="Connecting..."
        description="Setting up video call connection..."
        className="min-h-screen bg-red-50"
      >
        <span className="loading loading-dots loading-md"></span>
      </StatusCard>
    );
  }

  // Call not joined yet
  if (!call) {
    return (
      <StatusCard
        title="Joining call..."
        className="min-h-screen bg-green-50"
        description="no call"
      >
        <div className="animate-bounce h-16 w-16 mx-auto">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="text-green-600 font-mono text-sm bg-green-100 px-3 py-1 rounded-full inline-block">
          Call ID: {id}
        </div>
      </StatusCard>
    );
  }

  // Render video call
  return (
    <StreamVideo client={client}>
      <StreamTheme className="text-white">
        <StreamCall call={call}>{children}</StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}

export default Layout;
