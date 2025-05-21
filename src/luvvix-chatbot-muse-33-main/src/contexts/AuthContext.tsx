import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "@/luvvix-chatbot-muse-33-main/src/hooks/use-local-storage";
import { useAuth as useLuvvixAuth } from "@/hooks/useAuth";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  country?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[];
}

export interface AuthContextType {
  user: User | null;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, age?: number, country?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => string;
  saveCurrentConversation: (messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[]) => void;
  setCurrentConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  clearConversations: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Utiliser l'authentification de LuvviX ID
  const luvvixAuth = useLuvvixAuth();
  
  const [user, setUser] = useLocalStorage<User | null>("luvvix-user", null);
  const [proStatus, setProStatus] = useLocalStorage<boolean>("luvvix-pro-status", false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "luvvix-conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>(
    "luvvix-current-conversation-id",
    null
  );

  // Sync with LuvviX ID auth
  useEffect(() => {
    if (luvvixAuth.user && luvvixAuth.profile) {
      // Si l'utilisateur est connecté via LuvviX ID, on met à jour l'utilisateur local
      setUser({
        id: luvvixAuth.user.id,
        email: luvvixAuth.user.email || "",
        displayName: luvvixAuth.profile?.full_name || luvvixAuth.user.email?.split('@')[0] || "Utilisateur",
        // On peut ajouter d'autres champs selon les besoins
      });
      
      // On peut définir un statut pro en fonction de certaines conditions
      if (luvvixAuth.user.email?.includes('pro') || luvvixAuth.user.email?.includes('premium')) {
        setProStatus(true);
      }
      
      // Vérifier si l'utilisateur a des conversations existantes
      const userConversations = conversations.filter(
        (conv) => conv.id.startsWith(luvvixAuth.user.id)
      );
      
      if (userConversations.length > 0) {
        setCurrentConversationId(userConversations[0].id);
      } else {
        // Créer une nouvelle conversation si l'utilisateur n'en a pas
        const newConvId = createNewConversation();
        setCurrentConversationId(newConvId);
      }
    } else {
      // Si l'utilisateur n'est pas connecté, on réinitialise les données
      if (user !== null) {
        setUser(null);
      }
    }
  }, [luvvixAuth.user, luvvixAuth.profile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Utiliser l'authentification de LuvviX ID à la place
      await luvvixAuth.signIn(email, password);
      
      // Le reste de la logique est géré par l'effet useEffect ci-dessus
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string,
    age?: number,
    country?: string
  ) => {
    setIsLoading(true);
    try {
      // Utiliser l'authentification de LuvviX ID à la place
      await luvvixAuth.signUp(email, password, { 
        full_name: displayName || email.split('@')[0],
        username: email.split('@')[0]
      });
      
      // Le reste de la logique est géré par l'effet useEffect ci-dessus
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    luvvixAuth.signOut();
    setUser(null);
    setProStatus(false);
    setCurrentConversationId(null);
  };

  const createNewConversation = () => {
    const currentUserId = user?.id || luvvixAuth.user?.id || nanoid();
    const newId = `${currentUserId}-${nanoid()}`;
    
    const newConversation: Conversation = {
      id: newId,
      title: `Nouvelle conversation ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ? 😊",
          timestamp: new Date(),
        },
      ],
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newId);
    return newId;
  };

  const saveCurrentConversation = (
    messages: {
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }[]
  ) => {
    if (!currentConversationId) return;
    
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        let title = conv.title;
        if (messages.length > 1 && conv.messages.length <= 1) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
          }
        }
        
        return {
          ...conv,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  const renameConversation = (id: string, title: string) => {
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === id) {
        return {
          ...conv,
          title,
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
  };

  const updateConversationTitle = (id: string, title: string) => {
    renameConversation(id, title);
  };

  const clearConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro: proStatus,
        login,
        register,
        logout,
        isLoading,
        conversations,
        currentConversationId,
        createNewConversation,
        saveCurrentConversation,
        setCurrentConversation,
        deleteConversation,
        renameConversation,
        updateConversationTitle,
        clearConversations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
