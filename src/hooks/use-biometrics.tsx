
import { useState, useEffect, useCallback } from 'react';
import { authentivix, WebAuthnSession } from '@/utils/authentivix';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth provides user and session

interface BiometricsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSessionUpdate?: (session: WebAuthnSession) => void; // Callback to update auth state
}

export function useBiometrics(options?: BiometricsOptions) {
  const { user, session, refreshUser, loginWithToken } = useAuth(); // Get user, session and refreshUser from useAuth
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await authentivix.isBiometricAvailable();
        setIsAvailable(available);
        console.log("Biometrics available:", available);
      } catch (err) {
        console.error("Error checking biometric availability:", err);
        setIsAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  useEffect(() => {
    // Update enrollment status based on user object from useAuth
    // Assuming `user.app_metadata.has_webauthn_credentials` is the flag
    const enrolledStatus = user?.app_metadata?.has_webauthn_credentials === true;
    setIsEnrolled(enrolledStatus);
    console.log("Biometrics enrolled status from user object:", enrolledStatus);
  }, [user]);


  const enrollBiometrics = useCallback(async (userId: string, authToken: string): Promise<boolean> => {
    if (!isAvailable) {
      const err = new Error("Biometric authentication is not available on this browser/device.");
      setError(err);
      options?.onError?.(err);
      toast({
        variant: "destructive",
        title: "Biometric registration unavailable",
        description: err.message,
      });
      return false;
    }
    if (!authToken) {
      const err = new Error("Authentication token is required for enrollment.");
      setError(err);
      options?.onError?.(err);
      toast({ variant: "destructive", title: "Auth Token Missing", description: err.message });
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Enrolling biometrics for user:", userId);
      const success = await authentivix.enrollBiometrics(userId, authToken);
      
      if (success) {
        setIsEnrolled(true); // Optimistic update
        await refreshUser?.(); // Refresh user data to get the latest flag from backend
        options?.onSuccess?.();
        toast({
          title: "Biometric registration successful",
          description: "You can now use biometrics to log in.",
        });
        console.log("Biometric enrollment successful for user:", userId);
      } else {
        // Error is handled by authentivix, rethrow if needed or rely on its toast
        throw new Error("Biometric enrollment failed. Please try again.");
      }
      return success;
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('Unknown error during enrollment');
      setError(typedError);
      options?.onError?.(typedError);
      // Toast might be redundant if authentivix.enrollBiometrics already shows one
      if (!typedError.message.includes("Authenticator was probably already registered")) { // Avoid double toast
        toast({
          variant: "destructive",
          title: "Biometric Enrollment Error",
          description: typedError.message,
        });
      }
      console.error("Biometric enrollment error in hook:", typedError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, options, refreshUser]);

  const authenticateWithBiometrics = useCallback(async (email: string): Promise<WebAuthnSession | null> => {
    if (!isAvailable) {
      const err = new Error("Biometric authentication is not available on this browser/device.");
      setError(err);
      options?.onError?.(err);
      toast({ variant: "destructive", title: "Biometric Login Unavailable", description: err.message });
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("Authenticating with biometrics for email:", email);
      const webAuthnSession = await authentivix.authenticateWithBiometrics(email);
      
      if (webAuthnSession) {
        options?.onSuccess?.();
        // Call a method from useAuth to update the global session state
        // This is a placeholder, actual implementation depends on useAuth
        if (options?.onSessionUpdate) {
            options.onSessionUpdate(webAuthnSession);
        } else if (loginWithToken) {
            // Assuming loginWithToken can handle the full session object or extracts what it needs
            await loginWithToken(webAuthnSession.access_token, webAuthnSession.refresh_token);
             toast({
                title: "Login Successful",
                description: "You are now logged in with biometrics.",
            });
        } else {
            console.warn("No session update handler provided to useBiometrics or loginWithToken not available in useAuth.");
             toast({ // Give feedback even if session update is manual
                title: "Authentication Successful",
                description: "Biometric verification complete. Session data available.",
            });
        }
        console.log("Biometric authentication successful, session:", webAuthnSession);
        return webAuthnSession;
      } else {
        // Error is handled by authentivix, rethrow or rely on its toast
        throw new Error("Biometric authentication failed or was cancelled.");
      }
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('Unknown error during authentication');
      setError(typedError);
      options?.onError?.(typedError);
      // Toast might be redundant if authentivix.authenticateWithBiometrics already shows one
      toast({
        variant: "destructive",
        title: "Biometric Login Error",
        description: typedError.message,
      });
      console.error("Biometric authentication error in hook:", typedError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, options, loginWithToken]);

  const removeBiometrics = useCallback(async (userId: string, authToken: string): Promise<boolean> => {
    if (!authToken) {
      const err = new Error("Authentication token is required to remove biometrics.");
      setError(err);
      options?.onError?.(err);
      toast({ variant: "destructive", title: "Auth Token Missing", description: err.message });
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Attempting to remove biometrics for user:", userId);
      // authentivix.removeBiometrics is currently a stub.
      const success = authentivix.removeBiometrics(userId, authToken); 
      
      if (success) {
        // This part is currently unreachable if authentivix.removeBiometrics always returns false.
        // When implemented, this would be the optimistic update.
        setIsEnrolled(false); 
        await refreshUser?.(); // Refresh user data
        options?.onSuccess?.();
        toast({
          title: "Biometric authentication removed (locally)", // Adjust when backend implemented
          description: "Your biometric data has been removed from this device's perspective.",
        });
        console.log("Biometric data removal process initiated for user:", userId);
      } else {
        // This will be the typical path until removeBiometrics is fully implemented.
        toast({
          variant: "default",
          title: "Biometric Removal Not Implemented",
          description: "This feature is coming soon. For now, biometrics cannot be removed via this interface.",
        });
        // throw new Error("Error removing biometric data (stub function).");
      }
      return success; // Will be false due to stub
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('Unknown error during removal');
      setError(typedError);
      options?.onError?.(typedError);
      toast({
        variant: "destructive",
        title: "Biometric Removal Error",
        description: typedError.message,
      });
      console.error("Biometric removal error in hook:", typedError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options, refreshUser]);

  return {
    isAvailable,
    isEnrolled, // Now derived from useAuth().user
    isLoading,
    error,
    enrollBiometrics, // Takes userId, authToken
    authenticateWithBiometrics, // Takes email, returns Promise<WebAuthnSession | null>
    removeBiometrics // Takes userId, authToken (currently a stub)
  };
}
