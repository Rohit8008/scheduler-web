'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import apiClient from '@/lib/api';
import { syncUser } from '@/actions/users';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up the API client to use Firebase auth tokens
  useEffect(() => {
    apiClient.setAuthTokenGetter(async () => {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check if there's already a current user (speeds up initial load)
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }

    // Set a timeout to ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth state initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      clearTimeout(timeoutId); // Clear timeout since auth state has changed

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Sync user with database
          const dbUser = await syncUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          if (isMounted) {
            setUserData(dbUser);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          if (isMounted) {
            setUserData(null);
          }
        }
      } else {
        setUser(null);
        setUserData(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, additionalData = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Sync user with database
      const dbUser = await syncUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: additionalData.name || result.user.email?.split('@')[0] || '',
        photoURL: result.user.photoURL,
      });

      setUserData(dbUser);
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Request Google Calendar access
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');

      const result = await signInWithPopup(auth, provider);

      // Get the OAuth access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      console.log('🔑 Google Sign-In Result:', {
        hasCredential: !!credential,
        hasAccessToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
      });

      // Sync user with database (Prisma)
      const dbUser = await syncUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      });

      // Also sync with backend and save Google tokens
      if (accessToken) {
        console.log('💾 Saving access token to backend...');
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

          // First get or create backend user
          let backendUser;
          const getUserResponse = await fetch(`${API_URL}/api/users/firebase/${result.user.uid}`);

          if (getUserResponse.ok) {
            backendUser = await getUserResponse.json();
          } else {
            // Create backend user
            const createResponse = await fetch(`${API_URL}/api/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebaseUid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
              }),
            });
            backendUser = await createResponse.json();
          }

          // Update backend user with Google tokens
          const updateResponse = await fetch(`${API_URL}/api/users/${backendUser.id}`, {
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

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('❌ Failed to update backend user:', errorText);
          } else {
            const updatedUser = await updateResponse.json();
            console.log('✅ Google Calendar access token saved!', {
              userId: updatedUser.id,
              hasToken: !!updatedUser.googleAccessToken
            });
          }
        } catch (error) {
          console.error('❌ Error saving Google tokens to backend:', error);
          // Don't fail the login if token save fails
        }
      } else {
        console.warn('⚠️ No access token received from Google. User may need to re-authenticate.');
      }

      setUserData(dbUser);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const getIdToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
