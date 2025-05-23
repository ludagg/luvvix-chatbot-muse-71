
import { useState, useEffect } from 'react';

interface BiometricsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBiometrics(options?: BiometricsOptions) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Vérifier si l'API Web Authentication est disponible
    const checkAvailability = () => {
      if (window.PublicKeyCredential) {
        setIsAvailable(true);
        
        // Vérifier si l'utilisateur a déjà configuré la biométrie
        const enrolled = localStorage.getItem('luvvix_biometrics_enrolled') === 'true';
        setIsEnrolled(enrolled);
      } else {
        setIsAvailable(false);
      }
    };
    
    checkAvailability();
  }, []);

  const enrollBiometrics = async (userId: string): Promise<boolean> => {
    if (!isAvailable) {
      const error = new Error("L'authentification biométrique n'est pas disponible sur ce navigateur");
      setError(error);
      options?.onError?.(error);
      return false;
    }
    
    try {
      // Dans une implémentation réelle, nous générerions un défi côté serveur
      // Pour la démo, nous simulons l'inscription biométrique
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stocker l'état d'inscription
      localStorage.setItem('luvvix_biometrics_enrolled', 'true');
      localStorage.setItem('luvvix_biometrics_userid', userId);
      
      setIsEnrolled(true);
      options?.onSuccess?.();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      options?.onError?.(error);
      return false;
    }
  };

  const authenticateWithBiometrics = async (): Promise<string | null> => {
    if (!isAvailable || !isEnrolled) {
      const error = new Error("L'authentification biométrique n'est pas disponible ou n'est pas configurée");
      setError(error);
      options?.onError?.(error);
      return null;
    }
    
    try {
      // Dans une implémentation réelle, nous vérifierions l'authentification biométrique
      // Pour la démo, nous simulons une authentification réussie
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userId = localStorage.getItem('luvvix_biometrics_userid');
      options?.onSuccess?.();
      return userId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      options?.onError?.(error);
      return null;
    }
  };

  return {
    isAvailable,
    isEnrolled,
    error,
    enrollBiometrics,
    authenticateWithBiometrics
  };
}
