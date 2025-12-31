const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Sync or get user from backend by Firebase UID
 * Returns the backend user with the backend's user ID
 */
export async function syncBackendUser(firebaseUser) {
  try {
    // First try to get existing user by firebaseUid
    const response = await fetch(
      `${API_BASE_URL}/api/users/firebase/${firebaseUser.uid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }

    // If user doesn't exist, create them
    const createResponse = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create backend user: ${createResponse.statusText}`);
    }

    return await createResponse.json();
  } catch (error) {
    console.error("Error syncing backend user:", error);
    throw error;
  }
}
