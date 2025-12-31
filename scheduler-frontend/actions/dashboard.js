"use server"
import { db } from "@/lib/prisma";

// Note: For production, implement Firebase Admin SDK token verification
export async function getLatestUpdates(firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      firebaseUid,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const now = new Date();
  const upcomingMeetings = await db.booking.findMany({
    where: {
      userId: user.id,
      startTime: { gte: now },
    },
    include: {
      event: {
        select: { title: true },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  return upcomingMeetings;
}
