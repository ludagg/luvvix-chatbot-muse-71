
import { useEffect, useState } from 'react';
import authService from '@/utils/auth-service';
import { useToast } from '@/hooks/use-toast';

interface CrossAppAuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  redirectUrl?: string;
  autoInit?: boolean;
}

interface CrossAppAuthResult {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: any | null;
  login: (options?: { signup?: boolean }) => void;
  logout: () => void;
  globalLogout: () => void;
  getAppToken: () => Promise<string | null>;
}

/**
 * Hook pour gérer l'authentification entre applications LuvviX
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
      authService.isAuthenticated().then(authenticated => {
        setIsAuthenticated(authenticated);
        setIsInitialized(true);
        
        if (authenticated) {
          authService.getUserProfile().then(profile => {
            setUser(profile);
          });
        }
      });
      
      // Ajouter un écouteur pour les changements d'authentification
      const authListener = (authenticated: boolean) => {
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          authService.getUserProfile().then(profile => {
            setUser(profile);
          });
        } else {
          setUser(null);
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
  };
  
  // Fonction pour obtenir un token d'application
  const getAppToken = async () => {
    return await authService.getAppToken();
  };
  
  return {
    isAuthenticated,
    isInitialized,
    user,
    login,
    logout,
    globalLogout,
    getAppToken
  };
};

export default useCrossAppAuth;
