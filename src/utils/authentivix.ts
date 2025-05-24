
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 2.0.0 - Integrated with WebAuthn backend
 */

import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

// Types for the biometric authentication system
export interface AuthentivixOptions {
  apiUrl?: string; // Base URL for the auth API, e.g., https://<project_ref>.supabase.co/functions/v1/auth-api
}

// Define a type for the session object returned by the backend on successful login
export interface WebAuthnSession {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_at: number;
  // Add any other relevant fields from your backend's session response
}

// Main class for biometric authentication management
export class Authentivix {
  private options: Required<Pick<AuthentivixOptions, "apiUrl">>; // Only apiUrl is strictly required now
  
  constructor(options?: AuthentivixOptions) {
    // Use proper Vite environment variables instead of Deno
    const defaultApiUrl = 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api';

    this.options = {
      apiUrl: options?.apiUrl || defaultApiUrl,
    };
    if (!this.options.apiUrl.endsWith('/auth-api')) {
      this.options.apiUrl = this.options.apiUrl.replace(/\/$/, '') + '/auth-api';
    }
  }
  
  /**
   * Check if biometric authentication is available on the device
   * @returns {Promise<boolean>} True if available, False otherwise
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      // Check if the Web Authentication API is available
      if (window && 'PublicKeyCredential' in window) {
        // Check if the device supports biometric authentication
        if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        }
        // Fallback for older syntax or basic check
        return !!(window.PublicKeyCredential);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }
  
  /**
   * Check if the user has already set up biometric authentication.
   * @param {string} _userId - User identifier (currently unused).
   * @param {string} _authToken - Authentication token (currently unused).
   * @returns {boolean} True if configured, False otherwise.
   * @todo This method needs a proper backend implementation or removal.
   */
  isEnrolled(_userId?: string, _authToken?: string): boolean {
    console.warn("Authentivix.isEnrolled() is not fully implemented and currently returns false.");
    // TODO: Implement a backend call to check for existing WebAuthn credentials for the user.
    // For now, this will return false. UI logic should adapt.
    return false;
  }
  
  /**
   * Register the user's biometric data using WebAuthn.
   * @param {string} _userId - User identifier (not directly used here as backend gets it from token).
   * @param {string} authToken - Authentication token (JWT).
   * @returns {Promise<boolean>} True if registration succeeds, False otherwise.
   */
  async enrollBiometrics(_userId: string, authToken: string): Promise<boolean> {
    if (!authToken) {
      console.error("Authentication token is required for biometric enrollment.");
      return false;
    }

    try {
      // 1. Get registration options from the backend
      const regStartUrl = `${this.options.apiUrl}/webauthn/register/start`;
      const regStartResponse = await fetch(regStartUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        // body: JSON.stringify({ userId }), // userId is taken from token on backend
      });

      if (!regStartResponse.ok) {
        const errorData = await regStartResponse.json().catch(() => ({}));
        console.error("Failed to get registration options:", regStartResponse.status, errorData);
        throw new Error(`Failed to get registration options: ${errorData.error || regStartResponse.statusText}`);
      }
      
      const options: PublicKeyCredentialCreationOptionsJSON = (await regStartResponse.json()).data;

      // 2. Call startRegistration (from @simplewebauthn/browser)
      const attestationResponse = await startRegistration(options);

      // 3. Send attestation response to the backend to finish registration
      const regFinishUrl = `${this.options.apiUrl}/webauthn/register/finish`;
      const regFinishResponse = await fetch(regFinishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(attestationResponse),
      });

      if (!regFinishResponse.ok) {
        const errorData = await regFinishResponse.json().catch(() => ({}));
        console.error("Failed to finish registration:", regFinishResponse.status, errorData);
        throw new Error(`Failed to finish registration: ${errorData.error || regFinishResponse.statusText}`);
      }
      
      const finishData = await regFinishResponse.json();
      console.log("Biometric enrollment successful:", finishData);
      return finishData.success && finishData.data.verified === true;

    } catch (error) {
      console.error("Error during biometric enrollment:", error);
      // Ensure the error is an Error instance
      if (error instanceof Error && error.name === 'InvalidStateError') {
        alert("Authenticator was probably already registered. Try logging in.");
      } else {
        alert(`Enrollment failed: ${error.message}`);
      }
      return false;
    }
  }
  
  /**
   * Authenticate the user with their biometric data using WebAuthn.
   * @param {string} email - User's email to initiate login.
   * @returns {Promise<WebAuthnSession | null>} Session object if successful, null otherwise.
   */
  async authenticateWithBiometrics(email?: string): Promise<WebAuthnSession | null> {
    if (!email) {
      console.warn("Email is currently required for WebAuthn login start.");
    }

    try {
      // 1. Get authentication options from the backend
      const authStartUrl = `${this.options.apiUrl}/webauthn/login/start`;
      const authStartResponse = await fetch(authStartUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // Send email if provided
      });

      if (!authStartResponse.ok) {
        const errorData = await authStartResponse.json().catch(() => ({}));
        console.error("Failed to get authentication options:", authStartResponse.status, errorData);
        throw new Error(`Failed to get authentication options: ${errorData.error || authStartResponse.statusText}`);
      }
      const options: PublicKeyCredentialRequestOptionsJSON = (await authStartResponse.json()).data;

      // 2. Call startAuthentication (from @simplewebauthn/browser)
      const assertionResponse = await startAuthentication(options);

      // 3. Send assertion response to the backend to finish authentication
      const authFinishUrl = `${this.options.apiUrl}/webauthn/login/finish`;
      const authFinishResponse = await fetch(authFinishUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertionResponse),
      });

      if (!authFinishResponse.ok) {
        const errorData = await authFinishResponse.json().catch(() => ({}));
        console.error("Failed to finish authentication:", authFinishResponse.status, errorData);
        throw new Error(`Failed to finish authentication: ${errorData.error || authFinishResponse.statusText}`);
      }
      
      const finishData = await authFinishResponse.json();
      if (finishData.success && finishData.data.verified === true) {
        console.log("Biometric authentication successful:", finishData.data);
        return finishData.data as WebAuthnSession; // Contains tokens and user_id
      } else {
        throw new Error(finishData.error || "Authentication verification failed");
      }

    } catch (error) {
      console.error("Error during biometric authentication:", error);
      alert(`Login failed: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Remove the user's biometric data.
   * @param {string} _userId - User identifier.
   * @param {string} _authToken - Authentication token.
   * @returns {boolean} True if removal succeeds, False otherwise.
   * @todo This method needs a proper backend implementation.
   */
  removeBiometrics(_userId: string, _authToken: string): boolean {
    console.warn("Authentivix.removeBiometrics() is not implemented.");
    // TODO: Implement a backend call to delete specific WebAuthn credentials.
    return false;
  }
}

// Export a singleton instance for easy use
export const authentivix = new Authentivix({ 
  apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api'
});
export default authentivix;
