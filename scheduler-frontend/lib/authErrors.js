/**
 * Convert Firebase authentication error codes to user-friendly messages
 * @param {Error} error - Firebase authentication error
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  // If error has a code property (Firebase error)
  if (error?.code) {
    const errorCode = error.code;

    // Firebase Authentication error codes
    const errorMessages = {
      // Sign In errors
      'auth/invalid-email': 'Invalid email address format.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later or reset your password.',

      // Sign Up errors
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',

      // Google Sign In errors
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
      'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method.',

      // Network errors
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/timeout': 'Request timed out. Please try again.',

      // General errors
      'auth/internal-error': 'An internal error occurred. Please try again later.',
      'auth/invalid-api-key': 'Invalid API key. Please contact support.',
      'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
    };

    return errorMessages[errorCode] || error.message || 'An unexpected error occurred. Please try again.';
  }

  // If error has a message property
  if (error?.message) {
    return error.message;
  }

  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
};
