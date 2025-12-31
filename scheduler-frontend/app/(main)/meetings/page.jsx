"use client";
import { getUserMeetings } from "@/actions/meeting";
import { getPendingRequests, getSentRequests, getReceivedRequests } from "@/actions/meetingRequest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeetingList from "./_components/MeetingList";
import MeetingRequestList from "./_components/MeetingRequestList";
import NewMeetingRequestModal from "./_components/NewMeetingRequestModal";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Inbox, Send, Info } from "lucide-react";
import { syncBackendUser } from "@/lib/backendSync";

const MettingPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Meetings</h1>
          <p className="text-lg text-gray-600">
            View and manage your scheduled meetings and meeting requests
          </p>
        </div>
        <NewMeetingRequestModal onSuccess={() => window.location.reload()} />
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Automated Email Notifications</p>
            <p className="text-blue-800">
              All meeting requests trigger automatic email notifications. When approved, both parties receive a Google Meet link and calendar invitation (.ics file). When declined, the requester is notified with the reason.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
          <TabsTrigger value="upcoming" className="text-base">
            <Clock className="mr-2 h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="text-base">
            <Calendar className="mr-2 h-4 w-4" />
            Past
          </TabsTrigger>
          <TabsTrigger value="received" className="text-base">
            <Inbox className="mr-2 h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-base">
            <Send className="mr-2 h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-0">
          <UpcomingMeetings />
        </TabsContent>
        <TabsContent value="past" className="mt-0">
          <PastMeetings />
        </TabsContent>
        <TabsContent value="received" className="mt-0">
          <ReceivedRequests />
        </TabsContent>
        <TabsContent value="sent" className="mt-0">
          <SentRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function UpcomingMeetings() {
  const { user, getIdToken } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (user?.uid) {
        try {
          const token = await getIdToken();
          const data = await getUserMeetings("upcoming", user.uid, token);
          setMeetings(data);
        } catch (error) {
          console.error("Error fetching upcoming meetings:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMeetings();
  }, [user, getIdToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <PulseLoader color="#3498db" size={10} />
      </div>
    );
  }

  return <MeetingList meetings={meetings} type={"upcoming"} />;
}

function PastMeetings() {
  const { user, getIdToken } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (user?.uid) {
        try {
          const token = await getIdToken();
          const data = await getUserMeetings("past", user.uid, token);
          setMeetings(data);
        } catch (error) {
          console.error("Error fetching past meetings:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMeetings();
  }, [user, getIdToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <PulseLoader color="#3498db" size={10} />
      </div>
    );
  }

  return <MeetingList meetings={meetings} type={"past"} />;
}

function ReceivedRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);

  const fetchRequests = async () => {
    if (user && backendUser?.id) {
      setLoading(true);
      try {
        const data = await getReceivedRequests(backendUser.id);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching received requests:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initUser = async () => {
      if (user?.uid) {
        try {
          const userData = await syncBackendUser(user);
          setBackendUser(userData);
        } catch (error) {
          console.error("Error syncing backend user:", error);
        }
      }
    };

    initUser();
  }, [user]);

  useEffect(() => {
    if (backendUser) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <PulseLoader color="#3498db" size={10} />
      </div>
    );
  }

  return <MeetingRequestList requests={requests} type="received" onUpdate={fetchRequests} />;
}

function SentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);

  const fetchRequests = async () => {
    if (user && backendUser?.id) {
      setLoading(true);
      try {
        const data = await getSentRequests(backendUser.id);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching sent requests:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initUser = async () => {
      if (user?.uid) {
        try {
          const userData = await syncBackendUser(user);
          setBackendUser(userData);
        } catch (error) {
          console.error("Error syncing backend user:", error);
        }
      }
    };

    initUser();
  }, [user]);

  useEffect(() => {
    if (backendUser) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <PulseLoader color="#3498db" size={10} />
      </div>
    );
  }

  return <MeetingRequestList requests={requests} type="sent" onUpdate={fetchRequests} />;
}

export default MettingPage;
