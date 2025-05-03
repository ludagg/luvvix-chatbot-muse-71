
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { toast } from '@/components/ui/use-toast';

// Types for LuvviX ID user
export interface LuvviXUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

interface CrossAppAuthOptions {
  appName: 'main' | 'pharmacy' | 'streaming' | 'chat';
  autoInit?: boolean;
}

interface CrossAppAuthReturn {
  isAuthenticated: boolean;
  user: LuvviXUser | null;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Global event for cross app authentication
const SSO_LOGIN_EVENT = 'luvvix:auth:login';
const SSO_LOGOUT_EVENT = 'luvvix:auth:logout';
const SSO_LOCAL_STORAGE_KEY = 'luvvix-id-session';

// Liste des avatars prédéfinis pour les utilisateurs fictifs
const SAMPLE_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix4&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=luvvix5&backgroundColor=ffdfbf'
];

// Liste des noms d'utilisateurs fictifs
const SAMPLE_NAMES = [
  'Emma Martin',
  'Thomas Bernard',
  'Sophie Dubois',
  'Lucas Moreau',
  'Camille Petit',
  'Léo Robert',
  'Julie Lambert',
  'Alexandre Simon'
];

export const useCrossAppAuth = (options: CrossAppAuthOptions): CrossAppAuthReturn => {
  const { appName, autoInit = true } = options;
  const [session, setSession] = useLocalStorage<{user: LuvviXUser, token: string, expiresAt: number} | null>(SSO_LOCAL_STORAGE_KEY, null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (autoInit) {
      checkExistingSession();
    }
    
    // Listen for SSO events from other apps
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SSO_LOGIN_EVENT, handleLoginEvent);
    window.addEventListener(SSO_LOGOUT_EVENT, handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SSO_LOGIN_EVENT, handleLoginEvent);
      window.removeEventListener(SSO_LOGOUT_EVENT, handleLogoutEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkExistingSession = () => {
    setLoading(true);
    try {
      // If we have a session, consider the user authenticated
      if (session) {
        // Vérifier si la session a expiré
        if (session.expiresAt && session.expiresAt < Date.now()) {
          console.log("LuvviX ID session expired");
          setSession(null);
          setLoading(false);
        } else {
          // Simuler un délai pour la validation du token (plus réaliste)
          setTimeout(() => {
            console.log("LuvviX ID session validated");
            setLoading(false);
          }, 300);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking LuvviX ID session:', err);
      setError('Erreur lors de la vérification de l\'authentification');
      setLoading(false);
    }
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === SSO_LOCAL_STORAGE_KEY) {
      if (event.newValue) {
        try {
          const parsedSession = JSON.parse(event.newValue);
          setSession(parsedSession);
        } catch (error) {
          console.error('Error parsing session from storage event:', error);
        }
      } else {
        setSession(null);
      }
    }
  };

  const handleLoginEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{user: LuvviXUser, token: string, expiresAt: number}>;
    if (customEvent.detail) {
      setSession(customEvent.detail);
    }
  };

  const handleLogoutEvent = () => {
    setSession(null);
  };

  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un délai pour l'authentification (plus réaliste)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Index aléatoire pour choisir un avatar et un nom
      const randomIndex = Math.floor(Math.random() * SAMPLE_NAMES.length);
      const name = SAMPLE_NAMES[randomIndex];
      const avatar = SAMPLE_AVATARS[randomIndex % SAMPLE_AVATARS.length];
      
      // Email basé sur le nom avec un format cohérent
      const email = name.toLowerCase().replace(' ', '.') + '@utilisateur.luvvix.com';
      
      // Générer un ID LuvviX réaliste
      const userId = 'lvx_' + Math.random().toString(36).substring(2, 10) + 
                     '_' + Math.random().toString(36).substring(2, 6);
      
      // Créer un utilisateur fictif avec des préférences plus réalistes
      const mockUser: LuvviXUser = {
        id: userId,
        email: email,
        full_name: name,
        avatar_url: avatar,
        app_metadata: {
          roles: ['user'],
          app: appName,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString()
        },
        user_metadata: {
          preferences: {
            theme: 'dark',
            language: 'fr',
            notifications: {
              email: true,
              push: false
            }
          },
          bio: '',
          website: ''
        }
      };
      
      // Générer un token JWT fictif mais réaliste
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ 
        sub: userId, 
        email: email,
        name: name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'https://auth.luvvix.com/',
        aud: 'luvvix-client'
      }));
      const signature = btoa(Math.random().toString(36).substring(2));
      const mockToken = `${header}.${payload}.${signature}`;
      
      // Ajouter une date d'expiration (1 heure)
      const expiresAt = Date.now() + 3600 * 1000;
      
      // Create session
      const newSession = {
        user: mockUser,
        token: mockToken,
        expiresAt: expiresAt
      };
      
      // Store in localStorage
      setSession(newSession);
      
      // Broadcast login event to other apps
      window.dispatchEvent(new CustomEvent(SSO_LOGIN_EVENT, { 
        detail: newSession
      }));
      
      console.log(`LuvviX ID: Successfully authenticated as ${mockUser.full_name}`);
      setLoading(false);
    } catch (err: any) {
      console.error('LuvviX ID login error:', err);
      setError(err.message || 'Échec de la connexion');
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    
    try {
      // Simuler un délai pour la déconnexion (plus réaliste)
      setTimeout(() => {
        // Remove from localStorage
        setSession(null);
        
        // Broadcast logout event to other apps
        window.dispatchEvent(new Event(SSO_LOGOUT_EVENT));
        
        console.log('LuvviX ID: Successfully logged out');
        setLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('LuvviX ID logout error:', err);
      setError(err.message || 'Échec de la déconnexion');
      setLoading(false);
    }
  };

  return {
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    login,
    logout,
    loading,
    error
  };
};
