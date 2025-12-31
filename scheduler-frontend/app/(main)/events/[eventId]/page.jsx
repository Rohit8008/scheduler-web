"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserEvents, deleteEvent } from "@/actions/event";
import { getEventBookings, deleteBooking } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Video,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid && params.eventId) {
        try {
          // Fetch event details
          const { events } = await getUserEvents(user.uid);
          const currentEvent = events.find((e) => e.id === params.eventId);

          if (!currentEvent) {
            toast.error("Event not found");
            router.push("/events");
            return;
          }

          setEvent(currentEvent);

          // Fetch bookings
          const eventBookings = await getEventBookings(params.eventId, user.uid);
          setBookings(eventBookings);
        } catch (error) {
          console.error("Error fetching event details:", error);
          toast.error("Failed to load event details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user, params.eventId, router]);

  const handleDeleteEvent = async () => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This will also delete all ${bookings.length} bookings.`)) {
      return;
    }

    setDeleting(true);
    try {
      // First delete all bookings
      for (const booking of bookings) {
        await deleteBooking(booking.id, user.uid);
      }

      // Then delete the event
      await deleteEvent(params.eventId, user.uid);

      // Show success toast
      toast.success("Event and all bookings deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Navigate back to events page (will auto-refresh from useEffect)
      setTimeout(() => {
        router.push("/events");
      }, 500); // Small delay to show toast
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event. Please try again.", {
        position: "top-center",
        autoClose: 4000,
      });
      setDeleting(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      await deleteBooking(bookingId, user.uid);

      // Update UI immediately
      setBookings(bookings.filter((b) => b.id !== bookingId));

      // Update event booking count
      setEvent({
        ...event,
        _count: {
          ...event._count,
          bookings: event._count.bookings - 1,
        },
      });

      // Show success toast
      toast.success("Booking deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error(error.message || "Failed to delete booking. Please try again.", {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/${user.displayName || 'user'}/${params.eventId}`;
      await navigator.clipboard.writeText(link);
      toast.success("Event link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/events">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      {/* Event Details Card */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl text-gray-900">{event.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 text-base">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {event.duration} mins
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.isPrivate
                    ? "bg-gray-100 text-gray-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {event.isPrivate ? "Private" : "Public"}
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {bookings.length} Bookings
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Event Link</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm text-gray-800 truncate">
                {window.location.origin}/{user.displayName || 'user'}/{params.eventId}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-gray-100 pt-4 flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDeleteEvent}
            disabled={deleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : `Delete Event ${bookings.length > 0 ? `& ${bookings.length} Bookings` : ""}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Bookings ({bookings.length})
          </h2>
        </div>

        {bookings.length === 0 ? (
          <Card className="shadow-lg border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 text-center max-w-md">
                Share your event link to start receiving bookings
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="shadow-lg border-gray-200 hover:shadow-xl transition-all">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    {booking.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3" />
                    {booking.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{format(new Date(booking.startTime), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span>
                      {format(new Date(booking.startTime), "h:mm a")} -{" "}
                      {format(new Date(booking.endTime), "h:mm a")}
                    </span>
                  </div>
                  {booking.meetLink && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-green-600" />
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                  {booking.additionalInfo && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        &quot;{booking.additionalInfo}&quot;
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 pt-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    disabled={deletingBookingId === booking.id}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    {deletingBookingId === booking.id ? "Deleting..." : "Delete Booking"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
