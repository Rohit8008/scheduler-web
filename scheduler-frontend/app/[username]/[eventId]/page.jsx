import { notFound } from "next/navigation";
import { Suspense } from "react";
import BookingForm from "./_components/BookingForm";
import { getEventAvailability } from "@/actions/availability";
import { getEventDetails } from "@/actions/event";
import EventDetails from "./_components/EventDetails";

export async function generateMetadata({ params }) {
  const { username, eventId } = await params;

  const event = await getEventDetails(username, eventId);
  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Book ${event.title} with ${event.user.name} | Scheduler`,
    description: `Schedule a ${event.duration}-minute ${event.title} event with ${event.user.name}`,
  };
}

const EventPage = async ({ params }) => {
  const { username, eventId } = await params;
  const event = await getEventDetails(username, eventId);

  const availability = await getEventAvailability(eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading Booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventPage;
