
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { authentivix } from '@/utils/authentivix';
import { useAuth } from '@/hooks/useAuth';

interface UseBiometricsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface BiometricsState {
  isAvailable: boolean;
  isEnrolled: boolean;
  isLoading: boolean;
}

export function useBiometrics(options: UseBiometricsOptions = {}) {
  const { user, refreshUser } = useAuth();
  const [state, setState] = useState<BiometricsState>({
    isAvailable: false,
    isEnrolled: false,
    isLoading: true
  });

  // Check if biometrics are available and enrolled
  const checkBiometricStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const isAvailable = await authentivix.isBiometricAvailable();
      
      // Check enrollment status from user metadata
      const isEnrolled = user?.app_metadata?.has_webauthn_credentials === true;
      
      setState({
        isAvailable,
        isEnrolled,
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking biometric status:', error);
      setState({
        isAvailable: false,
        isEnrolled: false,
        isLoading: false
      });
    }
  }, [user]);

  // Enroll biometrics
  const enrollBiometrics = useCallback(async (userId: string, authToken: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await authentivix.enrollBiometrics(userId, authToken);
      
      if (success) {
        // Refresh user data to get updated metadata
        await refreshUser?.();
        
        setState(prev => ({ ...prev, isEnrolled: true, isLoading: false }));
        toast({
          title: "Authentification biométrique activée",
          description: "Vous pouvez maintenant vous connecter avec vos données biométriques"
        });
        options.onSuccess?.();
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        toast({
          variant: "destructive",
          title: "Échec de l'activation",
          description: "Impossible d'activer l'authentification biométrique"
        });
        return false;
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error.message || "Une erreur est survenue";
      toast({
        variant: "destructive",
        title: "Erreur d'activation",
        description: errorMessage
      });
      options.onError?.(error);
      return false;
    }
  }, [options, refreshUser]);

  // Remove biometrics (stub for now)
  const removeBiometrics = useCallback(async (userId: string, authToken: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // For now, this is a stub since removal isn't fully implemented
      toast({
        title: "Fonctionnalité à venir",
        description: "La suppression de l'authentification biométrique sera bientôt disponible"
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      options.onError?.(error);
      return false;
    }
  }, [options]);

  // Authenticate with biometrics
  const authenticateWithBiometrics = useCallback(async (email?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const session = await authentivix.authenticateWithBiometrics(email);
      
      if (session) {
        setState(prev => ({ ...prev, isLoading: false }));
        toast({
          title: "Authentification réussie",
          description: "Connexion biométrique effectuée avec succès"
        });
        options.onSuccess?.();
        return session;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      options.onError?.(error);
      return null;
    }
  }, [options]);

  // Initialize biometric status check when user changes
  useEffect(() => {
    if (user) {
      checkBiometricStatus();
    }
  }, [user, checkBiometricStatus]);

  return {
    ...state,
    enrollBiometrics,
    removeBiometrics,
    authenticateWithBiometrics,
    checkBiometricStatus
  };
}
