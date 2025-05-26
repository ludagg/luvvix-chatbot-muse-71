
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 3.0.0 - Full WebAuthn implementation
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
import { supabase } from '@/integrations/supabase/client';

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
  
  async isEnrolled(userId?: string, authToken?: string): Promise<boolean> {
    try {
      if (!authToken) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;
        authToken = session.access_token;
      }

      const response = await fetch(`${this.options.apiUrl}/webauthn/credentials/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return false;
      
      const result = await response.json();
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }
  
  async enrollBiometrics(userId: string, authToken: string): Promise<boolean> {
    if (!authToken) {
      console.error("Authentication token is required for biometric enrollment.");
      return false;
    }

    try {
      // Start registration process
      const startResponse = await fetch(`${this.options.apiUrl}/webauthn/register/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start registration');
      }

      const startResult = await startResponse.json();
      if (!startResult.success) {
        throw new Error(startResult.error || 'Failed to start registration');
      }

      // Start WebAuthn registration
      const registrationResponse = await startRegistration(startResult.data);

      // Finish registration
      const finishResponse = await fetch(`${this.options.apiUrl}/webauthn/register/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationResponse),
      });

      if (!finishResponse.ok) {
        throw new Error('Failed to finish registration');
      }

      const finishResult = await finishResponse.json();
      if (!finishResult.success) {
        throw new Error(finishResult.error || 'Failed to finish registration');
      }

      console.log("Biometric enrollment completed successfully");
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

      if (!email) {
        throw new Error("Email requis pour l'authentification biométrique");
      }

      // Start authentication process
      const startResponse = await fetch(`${this.options.apiUrl}/webauthn/login/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start authentication');
      }

      const startResult = await startResponse.json();
      if (!startResult.success) {
        throw new Error(startResult.error || 'Failed to start authentication');
      }

      // Start WebAuthn authentication
      const authenticationResponse = await startAuthentication(startResult.data);

      // Finish authentication
      const finishResponse = await fetch(`${this.options.apiUrl}/webauthn/login/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authenticationResponse),
      });

      if (!finishResponse.ok) {
        throw new Error('Failed to finish authentication');
      }

      const finishResult = await finishResponse.json();
      if (!finishResult.success) {
        throw new Error(finishResult.error || 'Failed to finish authentication');
      }

      const session: WebAuthnSession = {
        access_token: finishResult.data.access_token,
        refresh_token: finishResult.data.refresh_token,
        user_id: finishResult.data.user_id,
        expires_at: new Date(finishResult.data.expires_at).getTime()
      };
      
      console.log("Biometric authentication completed successfully");
      return session;

    } catch (error) {
      console.error("Error during biometric authentication:", error);
      throw error;
    }
  }
  
  async removeBiometrics(credentialId: string, authToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.options.apiUrl}/webauthn/credentials/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential_db_id: credentialId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete credential');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error removing biometric credential:", error);
      return false;
    }
  }

  async listCredentials(authToken: string) {
    try {
      const response = await fetch(`${this.options.apiUrl}/webauthn/credentials/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to list credentials');
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error listing credentials:", error);
      return [];
    }
  }
}

export const authentivix = new Authentivix({ 
  apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api'
});
export default authentivix;
