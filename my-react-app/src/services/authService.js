import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from './firebase'; // Reference to your Firebase auth instance
import { createUserProfile } from './profileService'; // Import profile creation function

/**
 * Signs up a new user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>} Firebase UserCredential object.
 */
export const signUpWithEmailPassword = async (email, password) => {
  // TODO: Later, this function could be adapted to integrate LuvviX ID.
  // For example, it might involve an initial LuvviX ID check or registration step,
  // and then potentially linking that with a Firebase user or using a custom token.
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      // Create a user profile document in Firestore
      await createUserProfile(userCredential.user, {
        // You can pass additional data here if needed at sign-up
        // For example, if you collected a displayName during sign-up form
      });
    }
    return userCredential;
  } catch (error) {
    console.error("Error during sign up and profile creation:", error);
    // Depending on how you want to handle errors, you might want to:
    // - Delete the Firebase Auth user if profile creation fails (complex rollback)
    // - Or, let the user exist and prompt them to complete profile setup later
    throw error; // Re-throw the error to be caught by the UI component
  }
};

/**
 * Logs in an existing user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>} Firebase UserCredential object.
 */
export const loginWithEmailPassword = (email, password) => {
  // TODO: Adapt for LuvviX ID. This might involve redirecting to a LuvviX ID login page
  // or using a LuvviX ID token to sign in with Firebase (e.g., via custom tokens).
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logs out the current user.
 * @returns {Promise<void>}
 */
export const logout = () => {
  return signOut(auth);
};

// Potentially, functions to handle LuvviX ID specific flows could be added here later.
// export const signUpWithLuvviX = (luvviXToken) => { ... }
// export const loginWithLuvviX = (luvviXToken) => { ... }
//
// Or, the existing functions could be modified to handle both cases:
// export const signUp = (method, credentials) => {
//   if (method === 'emailPassword') { ... }
//   if (method === 'luvviX') { ... }
// }
//
// This structure allows for future adaptability.
// The UI components would call these service functions.
// If LuvviX ID has its own SDK or specific API calls, they would be encapsulated here.
