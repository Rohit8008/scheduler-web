"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = useAuth();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        toast.error("Failed to connect Google Calendar");
        setStatus("error");
        setTimeout(() => router.push("/settings"), 2000);
        return;
      }

      if (!code) {
        toast.error("No authorization code received");
        setStatus("error");
        setTimeout(() => router.push("/settings"), 2000);
        return;
      }

      if (!userData?.id) {
        toast.error("User not authenticated");
        setStatus("error");
        setTimeout(() => router.push("/sign-in"), 2000);
        return;
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("http://localhost:8080/api/google-calendar/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.accessToken) {
          throw new Error(tokenData.error || "Failed to exchange token");
        }

        // Save token to user profile
        const userResponse = await fetch(`http://localhost:8080/api/users/${userData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userData,
            googleAccessToken: tokenData.accessToken,
            googleRefreshToken: tokenData.refreshToken,
          }),
        });

        if (!userResponse.ok) {
          throw new Error("Failed to save Google Calendar connection");
        }

        toast.success("Google Calendar connected successfully!");
        setStatus("success");
        setTimeout(() => router.push("/settings"), 1500);
      } catch (error) {
        console.error("Failed to complete OAuth flow:", error);
        toast.error("Failed to connect Google Calendar");
        setStatus("error");
        setTimeout(() => router.push("/settings"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, userData, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting to Google Calendar</h2>
            <p className="text-gray-600">Please wait while we complete the connection...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connected Successfully!</h2>
            <p className="text-gray-600">Redirecting you back to settings...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
            <p className="text-gray-600">Redirecting you back to settings...</p>
          </>
        )}
      </div>
    </div>
  );
}
