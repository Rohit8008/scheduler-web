"use server";

import { db } from "@/lib/prisma";
import apiClient from "@/lib/api";

// Create booking via Spring Boot backend API (with email notifications)
export async function createBooking(bookingData) {
  try {
    // Fetch the event details to get userId
    const event = await db.event.findUnique({
      where: { id: bookingData.eventId },
      include: { user: true },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Call Spring Boot backend API to create booking
    // Backend will save to database AND send emails automatically
    const response = await apiClient.createBooking({
      eventId: bookingData.eventId,
      userId: event.userId,
      name: bookingData.name,
      email: bookingData.email,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      additionalInfo: bookingData.additionalInfo || "",
      meetLink: "https://meet.google.com/new",
      googleEventId: `temp-${Date.now()}`,
    });

    // Backend sends emails asynchronously
    return {
      success: true,
      booking: response,
      meetLink: response.meetLink,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}

// Get all bookings for a specific event
export async function getEventBookings(eventId, firebaseUid) {
  try {
    if (!firebaseUid) {
      throw new Error("Unauthorized");
    }

    // Verify user owns the event
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { user: true },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.user.firebaseUid !== firebaseUid) {
      throw new Error("Unauthorized - you don't own this event");
    }

    // Fetch all bookings for this event
    const bookings = await db.booking.findMany({
      where: { eventId: eventId },
      orderBy: { startTime: "desc" },
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching event bookings:", error);
    throw error;
  }
}

// Delete a booking
export async function deleteBooking(bookingId, firebaseUid) {
  try {
    if (!firebaseUid) {
      throw new Error("Unauthorized");
    }

    // Fetch the booking with event details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          include: { user: true },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify user owns the event
    if (booking.event.user.firebaseUid !== firebaseUid) {
      throw new Error("Unauthorized - you don't own this event");
    }

    // Delete the booking
    await db.booking.delete({
      where: { id: bookingId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}

// Create a direct booking from user availability (no specific event)
export async function createDirectBooking(bookingData) {
  try {
    const { userId, name, email, startTime, endTime, additionalInfo } = bookingData;

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Find or create a default "Quick Meeting" event for this user
    let defaultEvent = await db.event.findFirst({
      where: {
        userId: userId,
        title: "Quick Meeting",
        isPrivate: false,
      },
    });

    // If no default event exists, create one
    if (!defaultEvent) {
      // Calculate duration from start and end times
      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end - start) / (1000 * 60)); // duration in minutes

      defaultEvent = await db.event.create({
        data: {
          userId: userId,
          title: "Quick Meeting",
          description: "A quick meeting scheduled directly from availability",
          duration: duration || 30, // Default to 30 minutes if calculation fails
          isPrivate: false,
        },
      });
    }

    // Call Spring Boot backend API to create booking with the default event
    const response = await apiClient.createBooking({
      eventId: defaultEvent.id,
      userId: userId,
      name: name,
      email: email,
      startTime: startTime,
      endTime: endTime,
      additionalInfo: additionalInfo || "",
      meetLink: "https://meet.google.com/new",
      googleEventId: `temp-${Date.now()}`,
    });

    return {
      success: true,
      booking: response,
      meetLink: response.meetLink,
    };
  } catch (error) {
    console.error("Error creating direct booking:", error);
    return { success: false, error: error.message };
  }
}
