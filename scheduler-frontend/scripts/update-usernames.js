/**
 * Script to update existing users with usernames
 * Run this once to ensure all existing users have usernames
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function updateExistingUsernames() {
  try {
    // Find all users without usernames
    const usersWithoutUsername = await db.user.findMany({
      where: {
        OR: [
          { username: null },
          { username: '' }
        ]
      }
    });

    console.log(`Found ${usersWithoutUsername.length} users without usernames`);

    for (const user of usersWithoutUsername) {
      // Generate username from email
      const baseUsername = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and generate unique one
      while (await db.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Update user with new username
      await db.user.update({
        where: { id: user.id },
        data: { username }
      });

      console.log(`Updated user ${user.email} with username: ${username}`);
    }

    console.log('✅ All users updated successfully!');
  } catch (error) {
    console.error('Error updating usernames:', error);
  } finally {
    await db.$disconnect();
  }
}

updateExistingUsernames();
