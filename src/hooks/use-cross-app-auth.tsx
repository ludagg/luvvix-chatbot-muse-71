
import { useEffect, useState } from 'react';
import authService from '@/utils/auth-service';
import { useToast } from '@/hooks/use-toast';
import authSync from '@/services/auth-sync';

interface CrossAppAuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  redirectUrl?: string;
  autoInit?: boolean;
  checkSubdomainAuth?: boolean;
}

interface CrossAppAuthResult {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: any | null;
  login: (options?: { signup?: boolean }) => void;
  logout: () => void;
  globalLogout: () => void;
  getAppToken: () => Promise<string | null>;
  revalidateAuth: () => Promise<boolean>;
}

/**
 * Hook pour gérer l'authentification entre applications LuvviX et sous-domaines
 * Permet de partager l'état d'authentification entre différentes applications
 */
export const useCrossAppAuth = (options: CrossAppAuthOptions): CrossAppAuthResult => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();
  
  // Initialisation du service d'authentification
  useEffect(() => {
    if (options.autoInit !== false) {
      const redirectUrl = options.redirectUrl || window.location.origin;
      
      authService.initialize({
        appName: options.appName,
        redirectUrl: redirectUrl
      });
      
      // Vérifier l'état d'authentification initial
      const checkAuth = async () => {
        try {
          // First check Supabase auth directly
          const authenticated = await authService.isAuthenticated();
          setIsAuthenticated(authenticated);
          
          if (authenticated) {
            const profile = await authService.getUserProfile();
            setUser(profile);
          }
          
          // Then force a sync to ensure cross-domain consistency
          authSync.forceSync();
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error during auth initialization:', error);
          setIsInitialized(true);
        }
      };
      
      checkAuth();
      
      // Ajouter un écouteur pour les changements d'authentification
      const authListener = (authenticated: boolean) => {
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          authService.getUserProfile().then(profile => {
            setUser(profile);
            // Force sync after authentication change
            authSync.forceSync();
          });
        } else {
          setUser(null);
          // Force sync after authentication change
          authSync.forceSync();
        }
      };
      
      authService.addAuthListener(authListener);
      
      return () => {
        authService.removeAuthListener(authListener);
      };
    }
  }, [options.appName, options.redirectUrl, options.autoInit]);
  
  // Vérifier si on a un callback d'authentification à traiter
  useEffect(() => {
    const checkForCallback = async () => {
      // Vérifier s'il y a un token dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        try {
          // On nettoie l'URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          // On traite le callback
          const result = await authService.handleCallback();
          
          setIsAuthenticated(true);
          setUser(result.user);
          
          // Force sync after authentication
          authSync.forceSync();
          
          toast({
            title: "Connexion réussie",
            description: `Bienvenue, ${result.user?.full_name || 'utilisateur'}!`,
          });
        } catch (error) {
          console.error('Error handling auth callback:', error);
          
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Impossible de vous connecter. Veuillez réessayer.",
          });
        }
      }
    };
    
    if (isInitialized) {
      checkForCallback();
    }
  }, [isInitialized, toast]);
  
  // Fonction pour rediriger vers la page de connexion
  const login = (loginOptions?: { signup?: boolean }) => {
    authService.redirectToLogin(loginOptions);
  };
  
  // Fonction pour se déconnecter de l'application actuelle
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    
    // Force sync after logout
    authSync.forceSync();
    
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
  };
  
  // Fonction pour se déconnecter de toutes les applications
  const globalLogout = () => {
    authService.globalLogout();
    setIsAuthenticated(false);
    setUser(null);
    
    // Force sync after global logout
    authSync.forceSync();
  };
  
  // Fonction pour obtenir un token d'application
  const getAppToken = async () => {
    return await authService.getAppToken();
  };
  
  // Fonction pour forcer une revérification de l'authentification
  const revalidateAuth = async (): Promise<boolean> => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated && !user) {
        const profile = await authService.getUserProfile();
        setUser(profile);
      } else if (!authenticated && user) {
        setUser(null);
      }
      
      // Force sync after revalidation
      authSync.forceSync();
      
      return authenticated;
    } catch (error) {
      console.error('Error revalidating authentication:', error);
      return false;
    }
  };
  
  return {
    isAuthenticated,
    isInitialized,
    user,
    login,
    logout,
    globalLogout,
    getAppToken,
    revalidateAuth
  };
};

export default useCrossAppAuth;
