import { db } from "./prisma";

export const checkUser = async (firebaseUser) => {
  if (!firebaseUser) {
    return null;
  }

  try {
    // Try to find user by firebaseUid
    const loggedInUser = await db?.user.findUnique({
      where: {
        firebaseUid: firebaseUser.uid,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // Create new user
    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
    const username = name.split(" ").join("-") + firebaseUser.uid.slice(-4);

    const newUser = await db.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        name,
        imageUrl: firebaseUser.photoURL || '',
        email: firebaseUser.email,
        username,
      },
    });
    return newUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};
