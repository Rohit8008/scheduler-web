"use server";
import { db } from "@/lib/prisma";
import { google } from "googleapis";
import { syncBackendUser } from "@/lib/backendSync";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Note: For production, implement Firebase Admin SDK token verification
async function getUserFromFirebase(firebaseUid) {
  const user = await db?.user.findUnique({
    where: {
      firebaseUid,
    },
  });
  return user;
}

export async function getUserMeetings(type = "upcoming", firebaseUid, authToken = null) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const user = await getUserFromFirebase(firebaseUid);

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // Fetch regular bookings from Prisma DB
  const bookings = await db.booking.findMany({
    where: {
      userId: user.id,
      startTime: type === "upcoming" ? { gte: now } : { lt: now },
    },
    include: {
      event: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: type === "upcoming" ? "asc" : "desc",
    },
  });

  // Fetch approved meeting requests from backend
  try {
    const backendUser = await syncBackendUser({ uid: firebaseUid });

    if (backendUser && backendUser.id) {
      // Prepare headers with auth token if available
      const headers = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Fetch both sent and received meeting requests
      const [sentRequests, receivedRequests] = await Promise.all([
        fetch(`${API_BASE_URL}/api/meeting-requests/sent/${backendUser.id}`, {
          method: "GET",
          headers,
          cache: "no-store",
        }).then(async res => {
          if (!res.ok) {
            console.error(`Failed to fetch sent requests: ${res.status} ${res.statusText}`);
            return [];
          }
          return res.json();
        }),
        fetch(`${API_BASE_URL}/api/meeting-requests/received/${backendUser.id}`, {
          method: "GET",
          headers,
          cache: "no-store",
        }).then(async res => {
          if (!res.ok) {
            console.error(`Failed to fetch received requests: ${res.status} ${res.statusText}`);
            return [];
          }
          return res.json();
        }),
      ]);

      console.log(`📊 Fetched meeting requests for ${type}:`, {
        sent: sentRequests.length,
        received: receivedRequests.length,
        sentApproved: sentRequests.filter(r => r.status === "APPROVED").length,
        receivedApproved: receivedRequests.filter(r => r.status === "APPROVED").length,
      });

      // Filter for approved requests and convert to meeting format
      const approvedRequests = [...sentRequests, ...receivedRequests]
        .filter(req => req.status === "APPROVED")
        .filter(req => {
          const startTime = new Date(req.startTime);
          return type === "upcoming" ? startTime >= now : startTime < now;
        })
        .map(req => ({
          id: req.id,
          name: req.requesterId === backendUser.id ? req.receiverName : req.requesterName,
          email: req.requesterId === backendUser.id ? req.receiverEmail : req.requesterEmail,
          startTime: new Date(req.startTime),
          endTime: new Date(req.endTime),
          meetLink: req.meetLink,
          additionalInfo: req.description,
          event: {
            title: req.title,
            description: req.description,
            user: {
              name: req.requesterId === backendUser.id ? req.receiverName : req.requesterName,
              email: req.requesterId === backendUser.id ? req.receiverEmail : req.requesterEmail,
            },
          },
          isMeetingRequest: true, // Flag to identify these
        }));

      // Combine bookings and approved requests
      const allMeetings = [...bookings, ...approvedRequests].sort((a, b) => {
        if (type === "upcoming") {
          return a.startTime - b.startTime;
        } else {
          return b.startTime - a.startTime;
        }
      });

      console.log(`✅ Returning ${allMeetings.length} total meetings (${bookings.length} bookings + ${approvedRequests.length} approved requests)`);

      return allMeetings;
    }
  } catch (error) {
    console.error("Error fetching meeting requests:", error);
    // If backend fetch fails, just return regular bookings
  }

  return bookings;
}

export async function cancelMeeting(meetingId, firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const user = await getUserFromFirebase(firebaseUid);

  if (!user) {
    throw new Error("User not found");
  }

  const meeting = await db.booking.findUnique({
    where: { id: meetingId },
    include: { event: true, user: true },
  });
  if (!meeting || meeting.userId !== user.id) {
    throw new Error("Meeting not found or unauthorized");
  }

  // TODO: Implement OAuth token retrieval from your backend or Firebase
  // For now, this will need to be integrated with your Spring Boot backend
  const token = null; // Get from backend API

  // Only delete from Google Calendar if token is available
  if (token) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: token });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.delete({
        calendarId: "primary",
        sendUpdates: "all",
        eventId: meeting.googleEventId,
      });
    } catch (error) {
      console.error("Failed to delete event from Google Calendar:", error);
      // Continue with database deletion even if calendar deletion fails
    }
  }

  // Delete the meeting from the database
  await db.booking.delete({
    where: { id: meetingId },
  });

  return { success: true };
}
