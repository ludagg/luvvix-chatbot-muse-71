
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface BiometricCapabilities {
  isSupported: boolean;
  isAvailable: boolean;
  platformAuthenticator: boolean;
  userVerification: boolean;
}

export const useEnhancedAuth = () => {
  const { user, signIn, signUp, signOut: baseSignOut } = useAuth();
  const [biometricCapabilities, setBiometricCapabilities] = useState<BiometricCapabilities>({
    isSupported: false,
    isAvailable: false,
    platformAuthenticator: false,
    userVerification: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      const isSupported = window.PublicKeyCredential !== undefined;
      
      if (isSupported) {
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        const platformAuthenticator = await PublicKeyCredential.isConditionalMediationAvailable?.() || false;
        
        setBiometricCapabilities({
          isSupported: true,
          isAvailable,
          platformAuthenticator,
          userVerification: isAvailable
        });
      }
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const registerBiometric = useCallback(async (email: string) => {
    if (!biometricCapabilities.isSupported || !user) {
      throw new Error('Biometric authentication not supported');
    }

    setIsLoading(true);
    try {
      // Get registration options from server
      const { data: options, error } = await supabase.functions.invoke('auth-api', {
        body: { 
          action: 'generate-registration-options',
          userId: user.id,
          email 
        }
      });

      if (error) throw error;

      // Start registration with WebAuthn
      const attResp = await startRegistration(options);

      // Verify registration
      const { data: verification, error: verifyError } = await supabase.functions.invoke('auth-api', {
        body: {
          action: 'verify-registration',
          userId: user.id,
          email,
          response: attResp
        }
      });

      if (verifyError) throw verifyError;

      return verification.verified;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [biometricCapabilities, user]);

  const authenticateWithBiometric = useCallback(async (email: string) => {
    if (!biometricCapabilities.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    setIsLoading(true);
    try {
      // Get authentication options
      const { data: options, error } = await supabase.functions.invoke('auth-api', {
        body: {
          action: 'generate-authentication-options',
          email
        }
      });

      if (error) throw error;

      // Start authentication
      const asseResp = await startAuthentication(options);

      // Verify authentication
      const { data: verification, error: verifyError } = await supabase.functions.invoke('auth-api', {
        body: {
          action: 'verify-authentication',
          email,
          response: asseResp
        }
      });

      if (verifyError) throw verifyError;

      if (verification.verified) {
        // Sign in user with custom token
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: verification.temporaryToken
        });

        if (signInError) throw signInError;
      }

      return verification.verified;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [biometricCapabilities]);

  const enhancedSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await baseSignOut();
      // Clear any cached biometric data
      if ('navigator' in window && 'credentials' in navigator) {
        // Clear conditional mediation cache if supported
      }
    } catch (error) {
      console.error('Enhanced sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [baseSignOut]);

  return {
    user,
    signIn,
    signUp,
    signOut: enhancedSignOut,
    registerBiometric,
    authenticateWithBiometric,
    biometricCapabilities,
    isLoading: isLoading || false
  };
};
