"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { requestCalendarAccess } from "@/lib/googleCalendar";
import { syncBackendUser } from "@/lib/backendSync";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Check if user has Google Calendar connected in backend
    const checkConnection = async () => {
      if (user?.uid) {
        try {
          console.log('🔍 Checking Calendar connection for user:', user.uid);
          const backendUser = await syncBackendUser(user);
          console.log('📊 Backend user data:', {
            id: backendUser?.id,
            email: backendUser?.email,
            hasGoogleToken: !!backendUser?.googleAccessToken,
            tokenPreview: backendUser?.googleAccessToken ? backendUser.googleAccessToken.substring(0, 20) + '...' : 'none'
          });
          setIsConnected(!!backendUser?.googleAccessToken);
        } catch (error) {
          console.error("❌ Error checking Calendar connection:", error);
        } finally {
          setCheckingStatus(false);
        }
      }
    };

    checkConnection();
  }, [user]);

  const handleConnectGoogleCalendar = async () => {
    setLoading(true);
    try {
      await requestCalendarAccess();
      setIsConnected(true);
      toast.success("Google Calendar connected successfully! You can now create permanent Meet links.");

      // Reload to refresh the status
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to connect Google Calendar:", error);
      toast.error("Failed to connect to Google Calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and integrations</p>
      </div>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically create Google Meet links for bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Connected to Google Calendar</p>
                <p className="text-sm text-green-700">
                  Your bookings will automatically create Google Meet links
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Google Calendar Not Connected</p>
                  <p className="text-sm text-amber-700">
                    Connect to enable automatic Google Meet link creation
                  </p>
                </div>
              </div>

              <Button
                onClick={handleConnectGoogleCalendar}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Connecting..." : "Connect Google Calendar"}
              </Button>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">Benefits of connecting:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Automatically create permanent Google Meet links for events</li>
                  <li>Generate real Meet links for meeting requests</li>
                  <li>Send calendar invitations (.ics) to attendees</li>
                  <li>No more generic /new links - each event gets a unique room</li>
                </ul>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Uses Firebase Authentication - no separate OAuth setup needed!
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{userData?.name || "Not set"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{userData?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <p className="text-gray-900">{userData?.username || "Not set"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
