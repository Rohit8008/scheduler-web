import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Get Firebase auth token
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

/**
 * Get pending meeting requests for a user
 */
export async function getPendingRequests(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meeting-requests/pending/${userId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pending requests: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    throw error;
  }
}

/**
 * Get sent meeting requests for a user
 */
export async function getSentRequests(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meeting-requests/sent/${userId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sent requests: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    throw error;
  }
}

/**
 * Get received meeting requests for a user
 */
export async function getReceivedRequests(userId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meeting-requests/received/${userId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch received requests: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching received requests:", error);
    throw error;
  }
}

/**
 * Create a new meeting request
 */
export async function createMeetingRequest(requestData) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/meeting-requests`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create meeting request: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating meeting request:", error);
    throw error;
  }
}

/**
 * Approve a meeting request
 */
export async function approveMeetingRequest(requestId) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meeting-requests/${requestId}/approve`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to approve meeting request: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving meeting request:", error);
    throw error;
  }
}

/**
 * Reject a meeting request
 */
export async function rejectMeetingRequest(requestId, reason) {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meeting-requests/${requestId}/reject`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reject meeting request: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting meeting request:", error);
    throw error;
  }
}
