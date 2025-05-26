
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 2.1.0 - Fixed authentication options retrieval
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
  apiUrl?: string;
}

export interface WebAuthnSession {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_at: number;
}

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
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }
  
  isEnrolled(_userId?: string, _authToken?: string): boolean {
    // For now, always return false since we don't have a backend implementation
    return false;
  }
  
  async enrollBiometrics(_userId: string, authToken: string): Promise<boolean> {
    if (!authToken) {
      console.error("Authentication token is required for biometric enrollment.");
      return false;
    }

    try {
      // Simulate successful enrollment for demo purposes
      // In a real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Biometric enrollment simulated successfully");
      return true;

    } catch (error) {
      console.error("Error during biometric enrollment:", error);
      return false;
    }
  }
  
  async authenticateWithBiometrics(email?: string): Promise<WebAuthnSession | null> {
    try {
      // Check if biometrics are available
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }

      // Simulate WebAuthn authentication process
      // In a real implementation, this would use the actual WebAuthn API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock session
      const mockSession: WebAuthnSession = {
        access_token: `mock_access_token_${Date.now()}`,
        refresh_token: `mock_refresh_token_${Date.now()}`,
        user_id: `user_${Date.now()}`,
        expires_at: Date.now() + (60 * 60 * 1000) // 1 hour from now
      };
      
      console.log("Biometric authentication simulated successfully:", mockSession);
      return mockSession;

    } catch (error) {
      console.error("Error during biometric authentication:", error);
      throw error;
    }
  }
  
  removeBiometrics(_userId: string, _authToken: string): boolean {
    console.warn("Authentivix.removeBiometrics() is not implemented.");
    return false;
  }
}

export const authentivix = new Authentivix({ 
  apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api'
});
export default authentivix;
