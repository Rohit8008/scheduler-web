"use server";

import { db } from "@/lib/prisma";

// Create or update user in database
export async function syncUser(userData) {
  const { uid, email, displayName, photoURL } = userData;

  try {
    // Try to find existing user
    let user = await db.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      // Generate a unique username from email or uid
      const baseUsername = email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and generate unique one
      while (await db.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user with username
      user = await db.user.create({
        data: {
          firebaseUid: uid,
          email: email,
          name: displayName || email?.split('@')[0] || '',
          imageUrl: photoURL || '',
          username: username,
        },
      });
    } else {
      // Update existing user
      user = await db.user.update({
        where: { firebaseUid: uid },
        data: {
          email: email,
          name: displayName || user.name,
          imageUrl: photoURL || user.imageUrl,
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
}

// Note: For production, implement Firebase Admin SDK token verification
export async function updateUserName(username, firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db?.user.findUnique({
    where: {
      firebaseUid,
    },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const existingUser = await db?.user.findUnique({
    where: { username },
  });

  if (existingUser && existingUser.id !== currentUser.id) {
    throw new Error("Username is already taken");
  }

  await db.user.update({
    where: { id: currentUser.id },
    data: { username },
  });

  return { success: true, message: "Username updated successfully" };
}

export async function getUserByUsername(username) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      events: {
        where: {
          isPrivate: false,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isPrivate: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });

  return user;
}

export async function getAllUsers(currentUserId) {
  try {
    const users = await db.user.findMany({
      where: {
        firebaseUid: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
        username: true,
        imageUrl: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
