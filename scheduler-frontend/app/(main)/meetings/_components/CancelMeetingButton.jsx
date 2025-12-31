"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cancelMeeting } from "@/actions/meeting";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/contexts/AuthContext";

export default function CancelMeetingButton({ meetingId }) {
  const router = useRouter();
  const { user } = useAuth();

  const { loading, error, fn: fnCancelMeeting } = useFetch(cancelMeeting);

  const handleCancel = async () => {
    if (!user?.uid) {
      console.error("User not authenticated");
      return;
    }
    if (window.confirm("Are you sure you want to cancel this meeting?")) {
      await fnCancelMeeting(meetingId, user.uid);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button variant="destructive" onClick={handleCancel} disabled={loading}>
        {loading ? "Canceling..." : "Cancel Meeting"}
      </Button>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
}