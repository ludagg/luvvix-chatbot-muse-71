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

// Custom error for when an authenticator is already registered
export class AuthenticatorRegisteredError extends Error {
  constructor(message?: string) {
    super(message || "This authenticator is already registered.");
    this.name = "AuthenticatorRegisteredError";
  }
}

// Main class for biometric authentication management
export class Authentivix {
  private options: Required<Pick<AuthentivixOptions, "apiUrl">>; 
  
  constructor(options?: AuthentivixOptions) {
    const defaultApiUrl = 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api';

    this.options = {
      apiUrl: options?.apiUrl || defaultApiUrl,
    };
    if (!this.options.apiUrl.endsWith('/auth-api')) {
      this.options.apiUrl = this.options.apiUrl.replace(/\/$/, '') + '/auth-api';
    }
  }
  
  async isBiometricAvailable(): Promise<boolean> {
    try {
      if (window && 'PublicKeyCredential' in window) {
        if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        }
        return !!(window.PublicKeyCredential);
      }
      return false;
    } catch (error) {
      console.error('Error checking biometric availability:', error); // Keep critical error log
      return false; 
    }
  }
  
  isEnrolled(_userId?: string, _authToken?: string): boolean {
    // This method is a stub and should be implemented properly or removed.
    // For now, it doesn't interact with WebAuthn directly so no specific errors to throw.
    console.warn("Authentivix.isEnrolled() is not fully implemented and currently returns false."); // Keep warning
    return false;
  }
  
  async enrollBiometrics(_userId: string, authToken: string): Promise<boolean> {
    if (!authToken) {
      throw new Error("Authentication token is required for biometric enrollment.");
    }

    let regStartResponse: Response;
    let regFinishResponse: Response;

    try {
      const regStartUrl = `${this.options.apiUrl}/webauthn/register/start`;
      regStartResponse = await fetch(regStartUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!regStartResponse.ok) {
        const errorData = await regStartResponse.json().catch(() => ({ message: regStartResponse.statusText }));
        throw new Error(`Enrollment failed: Failed to get registration options. Server said: ${errorData.error || errorData.message}`);
      }
      
      const options: PublicKeyCredentialCreationOptionsJSON = (await regStartResponse.json()).data;
      const attestationResponse = await startRegistration({ optionsJSON: options });

      const regFinishUrl = `${this.options.apiUrl}/webauthn/register/finish`;
      regFinishResponse = await fetch(regFinishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(attestationResponse),
      });

      if (!regFinishResponse.ok) {
        const errorData = await regFinishResponse.json().catch(() => ({ message: regFinishResponse.statusText }));
        throw new Error(`Enrollment failed: Failed to finish registration. Server said: ${errorData.error || errorData.message}`);
      }
      
      const finishData = await regFinishResponse.json();
      if (finishData.success && finishData.data.verified === true) {
        // console.log("Biometric enrollment successful:", finishData); // Removed debug log
        return true;
      } else {
        throw new Error(`Enrollment failed: ${finishData.error || "Verification by backend failed."}`);
      }

    } catch (error: any) {
      console.error("Error during biometric enrollment:", error); // Keep critical error log
      if (error.name === 'InvalidStateError') {
        throw new AuthenticatorRegisteredError("This authenticator has already been registered with this user account.");
      }
      if (error instanceof AuthenticatorRegisteredError || error.message.startsWith("Enrollment failed:")) {
        throw error; 
      }
      throw new Error(`Enrollment process failed: ${error.message || "An unknown error occurred."}`);
    }
  }
  
  async authenticateWithBiometrics(email?: string): Promise<WebAuthnSession | null> {
    let authStartResponse: Response;
    let authFinishResponse: Response;

    try {
      const authStartUrl = `${this.options.apiUrl}/webauthn/login/start`;
      authStartResponse = await fetch(authStartUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), 
      });

      if (!authStartResponse.ok) {
        const errorData = await authStartResponse.json().catch(() => ({ message: authStartResponse.statusText }));
        throw new Error(`Login failed: Failed to get authentication options. Server said: ${errorData.error || errorData.message}`);
      }
      const options: PublicKeyCredentialRequestOptionsJSON = (await authStartResponse.json()).data;
      const assertionResponse = await startAuthentication({ optionsJSON: options });

      const authFinishUrl = `${this.options.apiUrl}/webauthn/login/finish`;
      authFinishResponse = await fetch(authFinishUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertionResponse),
      });

      if (!authFinishResponse.ok) {
        const errorData = await authFinishResponse.json().catch(() => ({ message: authFinishResponse.statusText }));
        throw new Error(`Login failed: Failed to finish authentication. Server said: ${errorData.error || errorData.message}`);
      }
      
      const finishData = await authFinishResponse.json();
      if (finishData.success && finishData.data.verified === true && finishData.data.access_token) {
        // console.log("Biometric authentication successful:", finishData.data); // Removed debug log
        return finishData.data as WebAuthnSession;
      } else {
        throw new Error(`Login failed: ${finishData.error || "Authentication verification by backend failed."}`);
      }

    } catch (error: any) {
      console.error("Error during biometric authentication:", error); // Keep critical error log
      if (error.message.startsWith("Login failed:")) {
        throw error; 
      }
      throw new Error(`Authentication process failed: ${error.message || "An unknown error occurred."}`);
    }
  }
  
  removeBiometrics(_userId: string, _authToken: string): boolean {
    console.warn("Authentivix.removeBiometrics() is not implemented."); // Keep warning
    return false;
  }
}

export const authentivix = new Authentivix({ 
  apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api'
});
export default authentivix;
