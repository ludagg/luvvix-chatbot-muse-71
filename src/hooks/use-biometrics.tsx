
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
    // Vérifier si l'API Web Authentication est disponible
    const checkAvailability = async () => {
      try {
        const available = await authentivix.isBiometricAvailable();
        setIsAvailable(available);
        
        // Si nous avons un ID utilisateur stocké, vérifier si l'utilisateur a déjà configuré la biométrie
        const userId = localStorage.getItem('luvvix_biometrics_userid');
        if (userId) {
          const enrolled = authentivix.isEnrolled(userId);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la disponibilité biométrique:", err);
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
      toast({
        variant: "destructive",
        title: "Authentification biométrique non disponible",
        description: "Votre appareil ne prend pas en charge l'authentification biométrique"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Générer un token simulé pour la démonstration
      const token = btoa(`${userId}:${Date.now()}`);
      
      // Utiliser Authentivix pour enregistrer les données biométriques
      const success = await authentivix.enrollBiometrics(userId, token);
      
      if (success) {
        setIsEnrolled(true);
        options?.onSuccess?.();
        toast({
          title: "Authentification biométrique activée",
          description: "Vous pouvez maintenant vous connecter avec votre empreinte digitale"
        });
      } else {
        throw new Error("Erreur lors de l'enregistrement biométrique");
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Erreur d'activation",
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBiometrics = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Utiliser Authentivix pour l'authentification biométrique
      // Si autoPrompt est true, la fonction cherchera automatiquement tous les utilisateurs inscrits
      const token = await authentivix.authenticateWithBiometrics();
      
      if (token) {
        options?.onSuccess?.();
        
        // Extraire l'ID utilisateur du token (dans un environnement réel, ce serait fait de manière plus sécurisée)
        const decodedToken = atob(token);
        const userId = decodedToken.split(':')[0];
        
        return userId;
      } else {
        throw new Error("L'authentification biométrique a échoué");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "La vérification biométrique a échoué"
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
        toast({
          title: "Authentification biométrique désactivée",
          description: "Vos données biométriques ont été supprimées"
        });
      } else {
        throw new Error("Erreur lors de la suppression des données biométriques");
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      options?.onError?.(error);
      toast({
        variant: "destructive",
        title: "Erreur de désactivation",
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
