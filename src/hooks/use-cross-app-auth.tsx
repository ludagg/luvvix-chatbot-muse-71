
import { useEffect, useState } from 'react';
import authService from '@/utils/auth-service';
import { useToast } from '@/hooks/use-toast';

interface CrossAppAuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  redirectUrl?: string;
  autoInit?: boolean;
}

interface LoginOptions {
  email?: string;
  password?: string;
  signup?: boolean;
  metadata?: Record<string, any>;
}

interface CrossAppAuthResult {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  user: any | null;
  login: (options?: LoginOptions) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
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
        
        setIsLoading(false);
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
          setIsLoading(true);
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
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (isInitialized) {
      checkForCallback();
    }
  }, [isInitialized, toast]);
  
  // Fonction pour se connecter avec LuvviX ID
  const login = async (loginOptions: LoginOptions = {}) => {
    setIsLoading(true);
    try {
      if (loginOptions.email && loginOptions.password) {
        // Si email/mot de passe fournis, tentative de connexion directe
        // (A implémenter dans le SDK LuvviX ID)
        console.log('Direct login with credentials is not yet implemented');
      }
      
      // Redirection vers la page de connexion LuvviX ID
      authService.redirectToLogin({
        signup: loginOptions.signup,
        metadata: loginOptions.metadata
      });
      
      // Remarque: aucun besoin de gérer le retour ici
      // car le composant est rechargé après redirection et 
      // l'effet checkForCallback traitera le token
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };
  
  // Fonction pour se déconnecter de l'application actuelle
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
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
    isLoading,
    user,
    login,
    logout,
    globalLogout,
    getAppToken
  };
};

export default useCrossAppAuth;
