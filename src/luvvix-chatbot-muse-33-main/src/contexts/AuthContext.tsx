
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { authService } from '@/utils/auth-service';
import { toast } from '@/hooks/use-toast';

// Types d'utilisateur pour la compatibilité avec l'ancienne interface
interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl?: string | null;
  age?: number | null;
  country?: string | null;
  isPro?: boolean;
}

interface ConversationMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<any>;
}

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string, age?: number, country?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  globalLogout: () => Promise<boolean>;
  conversations: ConversationMetadata[];
  addConversation: (title?: string) => string;
  updateConversation: (id: string, data: Partial<ConversationMetadata>) => void;
  deleteConversation: (id: string) => void;
  getConversation: (id: string) => ConversationMetadata | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [conversations, setConversations] = useLocalStorage<ConversationMetadata[]>('luvvix_conversations', []);

  // Initialiser le service d'authentification LuvviX ID
  useEffect(() => {
    authService.initialize({
      appName: 'chat',
      redirectUrl: window.location.origin,
    });
    
    // Vérifier si l'utilisateur est déjà authentifié
    checkAuth();
    
    // Ajouter un écouteur pour les changements d'authentification
    authService.addAuthListener(handleAuthChange);
    
    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, []);

  // Vérifier l'authentification de l'utilisateur
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const profile = await authService.getUserProfile();
        if (profile) {
          // Mapper le profil utilisateur au format attendu
          const userData: User = {
            id: profile.id || nanoid(),
            email: profile.email || '',
            displayName: profile.display_name || profile.full_name || 'Utilisateur',
            avatarUrl: profile.avatar_url || null,
            country: profile.country || null,
            isPro: !!profile.subscriptions?.some(sub => sub.status === 'active') || false,
          };
          
          setUser(userData);
          setIsPro(userData.isPro || false);
        }
      } else {
        setUser(null);
        setIsPro(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les changements d'authentification
  const handleAuthChange = async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      checkAuth();
    } else {
      setUser(null);
      setIsPro(false);
    }
  };

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Redirection vers la page de connexion LuvviX ID
      authService.redirectToLogin();
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, displayName: string, age?: number, country?: string) => {
    try {
      setIsLoading(true);
      // Redirection vers la page d'inscription LuvviX ID
      authService.redirectToLogin({ signup: true });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsPro(false);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur LuvviX AI",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
      });
      return false;
    }
  };

  // Fonction de déconnexion globale
  const globalLogout = async () => {
    try {
      await authService.globalLogout();
      setUser(null);
      setIsPro(false);
      toast({
        title: "Déconnexion globale réussie",
        description: "Vous avez été déconnecté de tous vos comptes LuvviX",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion globale",
        description: error.message || "Une erreur est survenue lors de la déconnexion globale",
      });
      return false;
    }
  };

  // Fonctions de gestion des conversations
  const addConversation = (title?: string) => {
    const id = nanoid();
    const newConversation: ConversationMetadata = {
      id,
      title: title || 'Nouvelle discussion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    
    setConversations([newConversation, ...conversations]);
    return id;
  };

  const updateConversation = (id: string, data: Partial<ConversationMetadata>) => {
    setConversations(
      conversations.map(conv =>
        conv.id === id
          ? { ...conv, ...data, updatedAt: new Date().toISOString() }
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
  };

  const getConversation = (id: string) => {
    return conversations.find(conv => conv.id === id) || null;
  };

  const value = {
    user,
    isPro,
    isLoading,
    login,
    register,
    logout,
    globalLogout,
    conversations,
    addConversation,
    updateConversation,
    deleteConversation,
    getConversation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
