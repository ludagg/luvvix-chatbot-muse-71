
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 3.2.0 - Enhanced error handling and improved 401 management
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
      if (typeof window === 'undefined') return false;
      
      if ('PublicKeyCredential' in window) {
        // Check if WebAuthn is supported
        const isSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('WebAuthn platform authenticator available:', isSupported);
        return isSupported;
      }
      
      console.log('PublicKeyCredential not supported');
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
        if (!session) {
          console.log('No active session found');
          return false;
        }
        authToken = session.access_token;
      }

      const response = await fetch(`${this.options.apiUrl}/webauthn/credentials/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('Authentication token expired or invalid');
        return false;
      }

      if (!response.ok) {
        console.error('Failed to check enrollment:', response.status, await response.text());
        return false;
      }
      
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
      console.log('Starting biometric enrollment for user:', userId);
      
      // Check if biometrics are available first
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil");
      }

      // Verify token validity first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.access_token !== authToken) {
        throw new Error("Token d'authentification invalide ou expiré");
      }

      // Start registration process
      const startResponse = await fetch(`${this.options.apiUrl}/webauthn/register/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (startResponse.status === 401) {
        throw new Error("Token d'authentification invalide. Veuillez vous reconnecter.");
      }

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        console.error('Registration start failed:', errorText);
        throw new Error(`Échec du démarrage de l'inscription: ${startResponse.status}`);
      }

      const startResult = await startResponse.json();
      if (!startResult.success) {
        throw new Error(startResult.error || 'Failed to start registration');
      }

      console.log('Registration options received, starting WebAuthn registration...');

      // Start WebAuthn registration
      const registrationResponse = await startRegistration(startResult.data);

      console.log('WebAuthn registration completed, finishing...');

      // Finish registration
      const finishResponse = await fetch(`${this.options.apiUrl}/webauthn/register/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationResponse),
      });

      if (finishResponse.status === 401) {
        throw new Error("Token d'authentification invalide. Veuillez vous reconnecter.");
      }

      if (!finishResponse.ok) {
        const errorText = await finishResponse.text();
        console.error('Registration finish failed:', errorText);
        throw new Error(`Échec de finalisation de l'inscription: ${finishResponse.status}`);
      }

      const finishResult = await finishResponse.json();
      if (!finishResult.success) {
        throw new Error(finishResult.error || 'Failed to finish registration');
      }

      console.log("Biometric enrollment completed successfully");
      return true;

    } catch (error: any) {
      console.error("Error during biometric enrollment:", error);
      
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        throw new Error("L'utilisateur a annulé l'authentification biométrique");
      } else if (error.name === 'NotSupportedError') {
        throw new Error("L'authentification biométrique n'est pas supportée sur cet appareil");
      } else if (error.name === 'SecurityError') {
        throw new Error("Erreur de sécurité lors de l'authentification biométrique");
      } else if (error.name === 'InvalidStateError') {
        throw new Error("Un authenticateur est déjà enregistré pour cet utilisateur");
      }
      
      throw error;
    }
  }
  
  async authenticateWithBiometrics(email?: string): Promise<WebAuthnSession | null> {
    try {
      console.log('Starting biometric authentication for:', email);
      
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

      if (startResponse.status === 401) {
        throw new Error("Utilisateur non autorisé ou non trouvé");
      }

      if (startResponse.status === 404) {
        throw new Error("Aucun authenticateur trouvé pour cet utilisateur. Veuillez d'abord configurer l'authentification biométrique.");
      }

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        console.error('Authentication start failed:', errorText);
        throw new Error(`Échec du démarrage de l'authentification: ${startResponse.status}`);
      }

      const startResult = await startResponse.json();
      if (!startResult.success) {
        throw new Error(startResult.error || 'Failed to start authentication');
      }

      console.log('Authentication options received, starting WebAuthn authentication...');

      // Start WebAuthn authentication
      const authenticationResponse = await startAuthentication(startResult.data);

      console.log('WebAuthn authentication completed, finishing...');

      // Finish authentication
      const finishResponse = await fetch(`${this.options.apiUrl}/webauthn/login/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authenticationResponse),
      });

      if (finishResponse.status === 401) {
        throw new Error("Authentification biométrique échouée. Veuillez réessayer.");
      }

      if (!finishResponse.ok) {
        const errorText = await finishResponse.text();
        console.error('Authentication finish failed:', errorText);
        throw new Error(`Échec de finalisation de l'authentification: ${finishResponse.status}`);
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

    } catch (error: any) {
      console.error("Error during biometric authentication:", error);
      
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        throw new Error("L'utilisateur a annulé l'authentification biométrique");
      } else if (error.name === 'NotSupportedError') {
        throw new Error("L'authentification biométrique n'est pas supportée sur cet appareil");
      } else if (error.name === 'SecurityError') {
        throw new Error("Erreur de sécurité lors de l'authentification biométrique");
      } else if (error.name === 'InvalidStateError') {
        throw new Error("Aucun authenticateur trouvé pour cet utilisateur");
      }
      
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

      if (response.status === 401) {
        throw new Error("Token d'authentification invalide");
      }

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

      if (response.status === 401) {
        console.log('Authentication token expired or invalid');
        return [];
      }

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
