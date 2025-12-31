"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Re-authenticate user to request Google Calendar permissions
 * Use this for existing users who signed in before we added Calendar scope
 */
export async function requestCalendarAccess() {
  try {
    const provider = new GoogleAuthProvider();

    // Request Calendar scopes
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');

    // Force account selection to re-authenticate
    provider.setCustomParameters({
      prompt: 'consent' // Force consent screen to appear
    });

    const result = await signInWithPopup(auth, provider);

    // Get the OAuth access token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    // Save token to backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Get backend user
    const getUserResponse = await fetch(`${API_URL}/api/users/firebase/${result.user.uid}`);

    if (!getUserResponse.ok) {
      throw new Error('Backend user not found');
    }

    const backendUser = await getUserResponse.json();

    // Update with Google token
    await fetch(`${API_URL}/api/users/${backendUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: backendUser.id,
        firebaseUid: backendUser.firebaseUid,
        email: backendUser.email,
        name: backendUser.name,
        googleAccessToken: accessToken,
      }),
    });

    console.log('✅ Google Calendar access granted!');
    return { success: true, accessToken };
  } catch (error) {
    console.error('Error requesting Calendar access:', error);
    throw error;
  }
}
