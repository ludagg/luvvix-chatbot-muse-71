
import { useState, useEffect } from 'react';
import { authentivix } from '@/utils/authentivix';
import { toast } from '@/hooks/use-toast';

interface BiometricsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBiometrics(options?: BiometricsOptions) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if Web Authentication API is available
    const checkAvailability = async () => {
      try {
        const available = await authentivix.isBiometricAvailable();
        setIsAvailable(available);
        
        // If we have a user ID stored, check if user has already set up biometrics
        const userId = localStorage.getItem('luvvix_biometrics_userid');
        if (userId) {
          const enrolled = authentivix.isEnrolled(userId);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Error checking biometric availability:", err);
        setIsAvailable(false);
      }
    };
    
    checkAvailability();
  }, []);

  const enrollBiometrics = async (userId: string): Promise<boolean> => {
    if (!isAvailable) {
      const error = new Error("Biometric authentication is not available on this browser");
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Biometric authentication not available",
        description: "Your device does not support biometric authentication"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Generate a simulated token for the demo
      const token = btoa(`${userId}:${Date.now()}`);
      
      // Use Authentivix to register biometric data
      const success = await authentivix.enrollBiometrics(userId, token);
      
      if (success) {
        setIsEnrolled(true);
        localStorage.setItem('luvvix_biometrics_userid', userId);
        options?.onSuccess?.();
        toast({
          title: "Biometric authentication enabled",
          description: "You can now log in with your fingerprint"
        });
      } else {
        throw new Error("Error during biometric enrollment");
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Activation error",
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBiometrics = async (userId?: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Use Authentivix for biometric authentication
      // If autoPrompt is true, the function will automatically look for all enrolled users
      const token = await authentivix.authenticateWithBiometrics(userId);
      
      if (token) {
        options?.onSuccess?.();
        
        // Extract user ID from token (in a real environment, this would be done more securely)
        const decodedToken = atob(token);
        const userId = decodedToken.split(':')[0];
        
        return userId;
      } else {
        throw new Error("Biometric authentication failed");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Biometric verification failed"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeBiometrics = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = authentivix.removeBiometrics(userId);
      
      if (success) {
        setIsEnrolled(false);
        localStorage.removeItem('luvvix_biometrics_userid');
        toast({
          title: "Biometric authentication disabled",
          description: "Your biometric data has been removed"
        });
      } else {
        throw new Error("Error removing biometric data");
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Deactivation error",
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAvailable,
    isEnrolled,
    isLoading,
    error,
    enrollBiometrics,
    authenticateWithBiometrics,
    removeBiometrics
  };
}
