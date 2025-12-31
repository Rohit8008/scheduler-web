"use client";
import { Link, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/useFetch";
import { deleteEvent } from "@/actions/event";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

function EventCard({ event, username, isPublic = false, onDelete }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${username}/${event.id}`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  //Todo handle the errors here
  const {loading,error,fn:fnDeleteEvent} =useFetch(deleteEvent);

  const handleDelete = async(e)=>{
    // Prevent card click event
    e.stopPropagation();

    if(window?.confirm("Are you sure you want to delete this event?")){
        if (!user?.uid) {
          console.error("User not authenticated");
          toast.error("You must be logged in to delete events", {
            position: "top-center",
            autoClose: 3000,
          });
          return;
        }
        try {
          // Start fade-out animation
          setIsDeleting(true);

          await fnDeleteEvent(event.id, user.uid);

          // Show success toast
          toast.success("Event deleted successfully!", {
            position: "top-center",
            autoClose: 2000,
          });

          // Wait for animation to complete before removing from UI
          setTimeout(() => {
            if (onDelete) {
              onDelete(event.id);
            }
          }, 300); // Match transition duration
        } catch (error) {
          console.error("Failed to delete event:", error);
          setIsDeleting(false); // Reset animation state on error
          toast.error(error.message || "Failed to delete event. Please try again.", {
            position: "top-center",
            autoClose: 4000,
          });
        }
    }
  }

  const handleCardClick = (e) =>{
    if(e.target.tagName !== "BUTTON" && e.target.tagName !== "SVG"){
      // Navigate to event details page instead of public booking page
      if(!isPublic){
        router.push(`/events/${event.id}`);
      } else {
        window?.open(`${window?.location.origin}/${username}/${event.id}`,"_blank")
      }
    }
  }

  return (
    <Card
      className={`flex flex-col justify-between cursor-pointer shadow-lg rounded-2xl border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 ${
        isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-2xl text-gray-900">{event.title}</CardTitle>
        <CardDescription className="flex flex-wrap justify-between gap-2 text-base mt-2">
          <span className="flex items-center gap-2">
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
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            {event._count.bookings} Bookings
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-gray-700 leading-relaxed">
          {event.description.substring(0, event.description.indexOf(".")) || event.description}
        </p>
      </CardContent>
      {!isPublic && (
        <CardFooter className="flex gap-2 border-t border-gray-100 pt-4">
          <Button
            variant="outline"
            className="flex items-center flex-1 border-gray-300 hover:border-blue-600 hover:text-blue-600"
            onClick={handleCopy}
          >
            <Link className="mr-2 h-4 w-4" />
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || isDeleting}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {loading || isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default EventCard;
