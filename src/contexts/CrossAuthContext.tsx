import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useCrossAppAuth, LuvviXUser } from "@/hooks/use-cross-app-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { nanoid } from "nanoid";
import { toast } from "@/hooks/use-toast";

// Type pour une conversation
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

// Type pour le contexte d'authentification
export interface CrossAuthContextType {
  user: LuvviXUser | null;
  isPro: boolean;
  login: () => Promise<void>;
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

// Création du contexte
const CrossAuthContext = createContext<CrossAuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useCrossAuth = () => {
  const context = useContext(CrossAuthContext);
  if (context === undefined) {
    throw new Error("useCrossAuth must be used within a CrossAuthProvider");
  }
  return context;
};

interface CrossAuthProviderProps {
  children: ReactNode;
}

export const CrossAuthProvider: React.FC<CrossAuthProviderProps> = ({ children }) => {
  // Utilisation du hook LuvviX SSO
  const { 
    isAuthenticated, 
    user, 
    login: luvvixLogin, 
    logout: luvvixLogout, 
    loading 
  } = useCrossAppAuth({
    appName: 'chat',
    autoInit: true
  });

  // État local pour le statut pro
  const [proStatus, setProStatus] = useLocalStorage<boolean>("luvvix-pro-status", false);
  
  // États pour les conversations
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "luvvix-conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>(
    "luvvix-current-conversation-id",
    null
  );

  // Effet pour définir le statut pro basé sur les métadonnées de l'utilisateur
  useEffect(() => {
    if (user) {
      // Vérification si l'utilisateur est pro basée sur les métadonnées ou l'email
      const isPro = user.app_metadata?.plan === 'pro' || 
                    user.email.includes('pro') || 
                    user.email.includes('premium');
      
      setProStatus(isPro);
      
      // Gérer les conversations existantes pour cet utilisateur
      const userConversations = conversations.filter(
        (conv) => conv.id.startsWith(user.id)
      );
      
      if (userConversations.length > 0) {
        setCurrentConversationId(userConversations[0].id);
      } else {
        const newConvId = createNewConversation(user.id);
        setCurrentConversationId(newConvId);
      }
    }
  }, [user]);

  // Login avec LuvviX ID
  const login = async () => {
    try {
      await luvvixLogin();
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur LuvviX Chat!",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à LuvviX ID",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Logout avec LuvviX ID
  const logout = () => {
    try {
      luvvixLogout();
      setCurrentConversationId(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur lors de la déconnexion",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  // Création d'une nouvelle conversation
  const createNewConversation = (userId?: string) => {
    const newId = userId ? `${userId}-${nanoid()}` : nanoid();
    
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

  // Sauvegarde de la conversation courante
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

  // Définition de la conversation courante
  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  // Suppression d'une conversation
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

  // Renommage d'une conversation
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

  // Mise à jour du titre d'une conversation
  const updateConversationTitle = (id: string, title: string) => {
    renameConversation(id, title);
  };

  // Effacement de toutes les conversations
  const clearConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
  };

  return (
    <CrossAuthContext.Provider
      value={{
        user,
        isPro: proStatus,
        login,
        logout,
        isLoading: loading,
        conversations,
        currentConversationId,
        createNewConversation: () => createNewConversation(user?.id),
        saveCurrentConversation,
        setCurrentConversation,
        deleteConversation,
        renameConversation,
        updateConversationTitle,
        clearConversations,
      }}
    >
      {children}
    </CrossAuthContext.Provider>
  );
};
