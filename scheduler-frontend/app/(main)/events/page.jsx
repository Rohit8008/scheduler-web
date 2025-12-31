"use client";
import { getUserEvents } from "@/actions/event";
import EventCard from "@/components/EventCard";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (user?.uid) {
      setLoading(true);
      try {
        const { events: userEvents, username: uname } = await getUserEvents(user.uid);
        setEvents(userEvents);
        setUsername(uname);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pathname]); // Refetch when user changes or when returning to this page

  // Listen for focus event to refresh when user comes back to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchEvents();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle immediate UI update when event is deleted
  const handleEventDeleted = (eventId) => {
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-lg text-gray-600">
            Manage your event types and availability
          </p>
        </div>
        <Link href="/events/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Events Grid or Empty State */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Events Yet
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            Create your first event type to start accepting bookings from others
          </p>
          <Link href="/events/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              username={username}
              onDelete={handleEventDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
