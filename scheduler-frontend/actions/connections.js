import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getAuthToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

export async function sendConnectionRequest(receiverId, message = "") {
  try {
    const token = await getAuthToken();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Sync backend user to get backend ID
    const { syncBackendUser } = await import("@/lib/backendSync");
    const backendUser = await syncBackendUser(user);

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        senderId: backendUser.id,
        receiverId,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send connection request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending connection request:", error);
    throw error;
  }
}

export async function getAcceptedConnections(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/accepted/${userId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch accepted connections: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching accepted connections:", error);
    throw error;
  }
}

export async function getPendingSentConnections(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/pending-sent/${userId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pending sent connections");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending sent connections:", error);
    throw error;
  }
}

export async function getPendingReceivedConnections(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/pending-received/${userId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pending received connections");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending received connections:", error);
    throw error;
  }
}

export async function getBlockedConnections(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/blocked/${userId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blocked connections");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching blocked connections:", error);
    throw error;
  }
}

export async function acceptConnectionRequest(connectionId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/accept`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to accept connection request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error accepting connection request:", error);
    throw error;
  }
}

export async function rejectConnectionRequest(connectionId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/reject`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to reject connection request");
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    throw error;
  }
}

export async function blockConnection(connectionId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/block`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to block connection");
    }

    return;
  } catch (error) {
    console.error("Error blocking connection:", error);
    throw error;
  }
}

export async function removeConnection(connectionId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to remove connection");
    }

    return;
  } catch (error) {
    console.error("Error removing connection:", error);
    throw error;
  }
}

export async function checkConnection(userId1, userId2) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/connections/check/${userId1}/${userId2}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to check connection status");
    }

    const data = await response.json();
    return data.connected;
  } catch (error) {
    console.error("Error checking connection status:", error);
    throw error;
  }
}

export async function getUserAvailabilitySlots(userId, duration = 30) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/availability?duration=${duration}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch user availability: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user availability:", error);
    throw error;
  }
}
