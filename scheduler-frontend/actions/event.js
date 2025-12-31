"use server";

import { eventSchema } from "@/app/lib/validators";
import { db } from "@/lib/prisma";

// Note: For production, implement Firebase Admin SDK token verification
async function getUserFromFirebase(firebaseUid) {
  const user = await db?.user.findUnique({
    where: {
      firebaseUid,
    },
  });
  return user;
}

export async function createEvent(data, firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const validatedData = eventSchema.parse(data);
  const user = await getUserFromFirebase(firebaseUid);

  if (!user) {
    throw new Error("User not found");
  }

  const event = await db.event.create({
    data: {
      ...validatedData,
      userId: user.id,
    },
  });

  return event;
}

export async function getUserEvents(firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const user = await getUserFromFirebase(firebaseUid);

  if (!user) {
    throw new Error("User not found");
  }

  const events = await db.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return { events, username: user.username };
}

export async function deleteEvent(eventId, firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const user = await getUserFromFirebase(firebaseUid);

  if (!user) {
    throw new Error("User not found");
  }

  const event = await db?.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!event || event.userId !== user.id) {
    throw new Error("Event not found or unauthorized");
  }

  // Check if event has bookings
  if (event._count.bookings > 0) {
    throw new Error(`Cannot delete event with ${event._count.bookings} existing booking(s). Please cancel all bookings first.`);
  }

  await db.event.delete({
    where: { id: eventId },
  });

  return { success: true };
}

export async function getEventDetails(username, eventId) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        username: username,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          username: true,
          imageUrl: true,
        },
      },
    },
  });

  return event;
}
