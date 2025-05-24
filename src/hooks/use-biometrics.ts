import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { authentivix, AuthenticatorRegisteredError } from '@/utils/authentivix'; // Import AuthenticatorRegisteredError
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

  const checkBiometricStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const isAvailable = await authentivix.isBiometricAvailable();
      // Enrollment status is now more reliably checked via user metadata after login/refresh
      const isEnrolled = user?.app_metadata?.has_webauthn_credentials === true;
      setState({ isAvailable, isEnrolled, isLoading: false });
    } catch (error) {
      console.error('Error checking biometric status:', error);
      setState({ isAvailable: false, isEnrolled: false, isLoading: false });
      // Do not toast here, this is a background check
    }
  }, [user]);

  const enrollBiometrics = useCallback(async (userId: string, authToken: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const success = await authentivix.enrollBiometrics(userId, authToken);
      if (success) {
        await refreshUser?.(); // Refresh user to get updated app_metadata
        setState(prev => ({ ...prev, isEnrolled: true, isLoading: false }));
        toast({
          title: "Authentification biométrique activée",
          description: "Vous pouvez maintenant vous connecter avec vos données biométriques."
        });
        localStorage.setItem('luvvixAuth.hasEnrolledBiometricsHere', 'true');
        options.onSuccess?.();
        return true;
      } else {
        // This case should ideally not be reached if authentivix.ts throws errors for all failures.
        // However, keeping it as a fallback.
        setState(prev => ({ ...prev, isLoading: false }));
        toast({
          variant: "destructive",
          title: "Échec de l'activation",
          description: "Impossible d'activer l'authentification biométrique pour une raison inconnue."
        });
        options.onError?.(new Error("Enrollment failed for an unknown reason"));
        return false;
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (error instanceof AuthenticatorRegisteredError) {
        toast({
          variant: "destructive",
          title: "Authentificateur déjà enregistré",
          description: error.message || "Cet authentificateur biométrique est déjà enregistré. Essayez de vous connecter ou utilisez un autre authentificateur.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'activation biométrique",
          description: error.message || "Une erreur est survenue lors de l'activation.",
        });
      }
      options.onError?.(error);
      return false;
    }
  }, [options, refreshUser]);

  const removeBiometrics = useCallback(async (userId: string, authToken: string) => {
    // This remains a stub as per previous versions
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      toast({
        title: "Fonctionnalité à venir",
        description: "La suppression de l'authentification biométrique sera bientôt disponible."
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      options.onError?.(error);
      return false;
    }
  }, [options]);

  const authenticateWithBiometrics = useCallback(async (email?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const session = await authentivix.authenticateWithBiometrics(email);
      if (session) {
        setState(prev => ({ ...prev, isLoading: false }));
        toast({
          title: "Vérification biométrique réussie",
          description: "Poursuite de la connexion..." // More neutral message, as useAuth will confirm full login
        });
        options.onSuccess?.(); // This typically signals the UI to proceed with the session
        return session;
      } else {
        // This case should ideally not be reached if authentivix.ts throws errors.
        setState(prev => ({ ...prev, isLoading: false }));
        toast({
          variant: "destructive",
          title: "Échec de l'authentification biométrique",
          description: "La vérification biométrique a échoué pour une raison inconnue.",
        });
        options.onError?.(new Error("Authentication failed for an unknown reason"));
        return null;
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (error.name === 'NotAllowedError') {
        toast({
          variant: "destructive",
          title: "Authentification biométrique non autorisée",
          description: "L'opération a été annulée ou n'est pas autorisée par la politique de sécurité de votre appareil. Veuillez réessayer.",
        });
      } else if (error.name === 'NotFoundError' || (error.message && error.message.toLowerCase().includes("credential not found"))) {
        toast({
          variant: "destructive",
          title: "Identifiants biométriques non trouvés",
          description: "Aucune information biométrique n'a été trouvée pour ce compte sur cet appareil. Veuillez enregistrer la biométrie d'abord.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'authentification biométrique",
          description: error.message || "Une erreur est survenue lors de la tentative de connexion biométrique.",
        });
      }
      options.onError?.(error);
      return null;
    }
  }, [options]);

  useEffect(() => {
    if (user) { // Check biometric status when user object is available
      checkBiometricStatus();
    } else { // If no user, reset biometric status
       setState(prev => ({ ...prev, isEnrolled: false, isLoading: false }));
    }
  }, [user, checkBiometricStatus]);
  
  // Initial check for availability on mount, independent of user
  useEffect(() => {
    async function initialCheck() {
      setState(prev => ({ ...prev, isLoading: true }));
      const isAvailable = await authentivix.isBiometricAvailable();
      setState(prev => ({ ...prev, isAvailable, isLoading: false }));
    }
    initialCheck();
  }, []);


  return {
    ...state,
    enrollBiometrics,
    removeBiometrics,
    authenticateWithBiometrics,
    checkBiometricStatus
  };
}
