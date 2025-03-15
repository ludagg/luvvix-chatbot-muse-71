import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  country?: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, age?: number, country?: string) => Promise<void>;
  logout: () => Promise<void>;
  createNewConversation: () => void;
  loadConversation: (conversationId: string) => void;
  saveCurrentConversation: (messages: Conversation['messages']) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const getUserCredentials = () => {
    const credentials = localStorage.getItem('luvvix_credentials');
    return credentials ? JSON.parse(credentials) : {};
  };

  const saveUserCredentials = (email: string, password: string, userData: Partial<User> = {}) => {
    const credentials = getUserCredentials();
    credentials[email] = { 
      password,
      userData
    };
    localStorage.setItem('luvvix_credentials', JSON.stringify(credentials));
  };

  const verifyCredentials = (email: string, password: string) => {
    const credentials = getUserCredentials();
    return credentials[email] && credentials[email].password === password;
  };

  const getUserData = (email: string) => {
    const credentials = getUserCredentials();
    return credentials[email]?.userData || {};
  };

  const loadUserConversations = (userId: string) => {
    try {
      const savedConversations = localStorage.getItem(`luvvix_conversations_${userId}`);
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        const formattedConversations = parsedConversations.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(formattedConversations);
        
        if (formattedConversations.length > 0) {
          setCurrentConversationId(formattedConversations[0].id);
        }
      } else {
        createNewConversation();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      createNewConversation();
    }
  };

  const saveConversations = () => {
    if (user) {
      localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify(conversations));
    }
  };

  const createNewConversation = () => {
    let greeting = "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ? 😊";
    
    if (user?.displayName) {
      greeting = `Bonjour ${user.displayName} ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ? 😊`;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: `Nouvelle discussion ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [{
        id: "1",
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    
    if (user) {
      localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify(updatedConversations));
    }
  };

  const loadConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const saveCurrentConversation = (messages: Conversation['messages']) => {
    if (!currentConversationId || !user) return;
    
    const updatedConversations = conversations.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages } 
        : conv
    );
    
    if (currentConversationId && currentConversationId.startsWith('Nouvelle discussion') && messages.length >= 3) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
        updatedConversations.find(c => c.id === currentConversationId).title = title;
      }
    }
    
    setConversations(updatedConversations);
    localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify(updatedConversations));
  };

  const updateConversationTitle = (conversationId: string, title: string) => {
    if (!user) return;
    
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title } 
        : conv
    );
    
    setConversations(updatedConversations);
    localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify(updatedConversations));
  };

  const deleteConversation = (conversationId: string) => {
    if (!user) return;
    
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
      } else {
        createNewConversation();
        return;
      }
    }
    
    localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify(updatedConversations));
  };

  const setCurrentConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('luvvix_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        loadUserConversations(parsedUser.id);
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      localStorage.removeItem('luvvix_user');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && conversations.length > 0) {
      saveConversations();
    }
  }, [conversations, user]);

  const login = async (email: string, password: string) => {
    console.log(`Login attempt for ${email}`);
    setIsLoading(true);
    
    try {
      if (!verifyCredentials(email, password)) {
        console.error('Invalid credentials');
        throw new Error("Email ou mot de passe incorrect");
      }
      
      const userData = getUserData(email);
      
      const savedUser = {
        id: `user_${email.split('@')[0]}`,
        email,
        displayName: userData.displayName || email.split('@')[0],
        age: userData.age,
        country: userData.country,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('luvvix_user', JSON.stringify(savedUser));
      setUser(savedUser);
      
      loadUserConversations(savedUser.id);
      
      console.log('Login successful for', email);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${savedUser.displayName} sur LuvviX AI`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants et réessayez",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string, age?: number, country?: string) => {
    console.log(`Register attempt for ${email}`);
    setIsLoading(true);
    
    try {
      const credentials = getUserCredentials();
      if (credentials[email]) {
        console.error('User already exists');
        throw new Error("Un compte avec cet email existe déjà");
      }
      
      saveUserCredentials(email, password, { displayName, age, country });
      
      const newUser = {
        id: `user_${email.split('@')[0]}`,
        email,
        displayName: displayName || email.split('@')[0],
        age,
        country,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('luvvix_user', JSON.stringify(newUser));
      setUser(newUser);
      
      loadUserConversations(newUser.id);
      
      console.log('Registration successful for', email);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue ${newUser.displayName} sur LuvviX AI`,
      });
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de la création de votre compte",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('luvvix_user');
      setUser(null);
      setConversations([]);
      setCurrentConversationId(null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur LuvviX AI",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      conversations, 
      currentConversationId,
      login, 
      register, 
      logout,
      createNewConversation,
      loadConversation,
      saveCurrentConversation,
      updateConversationTitle,
      deleteConversation,
      setCurrentConversation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
