
import { useState, useEffect, useCallback, useRef } from 'react';
import Gun from 'gun';
import { toast } from '@/hooks/use-toast';

// Types pour notre système de chat décentralisé
export interface DecentralizedMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  conversationId: string;
}

export interface DecentralizedConversation {
  id: string;
  name?: string;
  participants: string[];
  lastMessage?: DecentralizedMessage;
  lastActivity: number;
}

export interface DecentralizedContact {
  id: string;
  name: string;
  publicKey: string;
  addedAt: number;
}

export const useGunChat = () => {
  const [messages, setMessages] = useState<{ [key: string]: DecentralizedMessage[] }>({});
  const [conversations, setConversations] = useState<DecentralizedConversation[]>([]);
  const [contacts, setContacts] = useState<DecentralizedContact[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const gunRef = useRef<any>(null);
  const userRef = useRef<any>(null);

  // Initialiser Gun
  useEffect(() => {
    // Configuration Gun avec plusieurs pairs
    gunRef.current = Gun([
      'https://gun-manhattan.herokuapp.com/gun',
      'https://gun-us.herokuapp.com/gun'
    ]);

    // Générer un ID utilisateur unique
    const userId = localStorage.getItem('gunjs-user-id') || 
                   `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!localStorage.getItem('gunjs-user-id')) {
      localStorage.setItem('gunjs-user-id', userId);
    }
    
    setCurrentUser(userId);
    userRef.current = gunRef.current.get('users').get(userId);

    setLoading(false);
  }, []);

  // Charger les conversations
  const loadConversations = useCallback(() => {
    if (!gunRef.current || !currentUser) return;

    const userConversations = gunRef.current.get('user-conversations').get(currentUser);
    
    userConversations.map().on((data: any, key: string) => {
      if (data && key) {
        const conversation: DecentralizedConversation = {
          id: key,
          name: data.name,
          participants: data.participants || [],
          lastActivity: data.lastActivity || Date.now()
        };

        setConversations(prev => {
          const existing = prev.find(c => c.id === key);
          if (existing) {
            return prev.map(c => c.id === key ? conversation : c);
          }
          return [...prev, conversation].sort((a, b) => b.lastActivity - a.lastActivity);
        });
      }
    });
  }, [currentUser]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback((conversationId: string) => {
    if (!gunRef.current) return;

    const conversationMessages = gunRef.current.get('conversations').get(conversationId).get('messages');
    
    conversationMessages.map().on((data: any, key: string) => {
      if (data && key) {
        const message: DecentralizedMessage = {
          id: key,
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp,
          conversationId: conversationId
        };

        setMessages(prev => ({
          ...prev,
          [conversationId]: [
            ...(prev[conversationId] || []).filter(m => m.id !== key),
            message
          ].sort((a, b) => a.timestamp - b.timestamp)
        }));
      }
    });
  }, []);

  // Envoyer un message
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!gunRef.current || !currentUser || !content.trim()) return;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    const message: DecentralizedMessage = {
      id: messageId,
      content: content.trim(),
      sender: currentUser,
      timestamp,
      conversationId
    };

    // Sauvegarder le message
    gunRef.current.get('conversations').get(conversationId).get('messages').get(messageId).put({
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp
    });

    // Mettre à jour la dernière activité de la conversation
    gunRef.current.get('user-conversations').get(currentUser).get(conversationId).put({
      lastActivity: timestamp
    });

    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé sur le réseau décentralisé"
    });
  }, [currentUser]);

  // Créer une nouvelle conversation
  const createConversation = useCallback((participantId: string, name?: string) => {
    if (!gunRef.current || !currentUser) return null;

    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    const conversation = {
      name: name || `Conversation avec ${participantId}`,
      participants: [currentUser, participantId],
      lastActivity: timestamp
    };

    // Créer la conversation pour l'utilisateur actuel
    gunRef.current.get('user-conversations').get(currentUser).get(conversationId).put(conversation);
    
    // Créer la conversation pour l'autre participant
    gunRef.current.get('user-conversations').get(participantId).get(conversationId).put(conversation);

    toast({
      title: "Conversation créée",
      description: "Nouvelle conversation décentralisée créée"
    });

    return conversationId;
  }, [currentUser]);

  // Ajouter un contact
  const addContact = useCallback((contactId: string, name: string) => {
    if (!gunRef.current || !currentUser) return;

    const contact: DecentralizedContact = {
      id: contactId,
      name,
      publicKey: contactId, // Simplified for now
      addedAt: Date.now()
    };

    gunRef.current.get('user-contacts').get(currentUser).get(contactId).put({
      name: contact.name,
      publicKey: contact.publicKey,
      addedAt: contact.addedAt
    });

    toast({
      title: "Contact ajouté",
      description: "Contact ajouté au réseau décentralisé"
    });
  }, [currentUser]);

  // Charger les contacts
  const loadContacts = useCallback(() => {
    if (!gunRef.current || !currentUser) return;

    const userContacts = gunRef.current.get('user-contacts').get(currentUser);
    
    userContacts.map().on((data: any, key: string) => {
      if (data && key) {
        const contact: DecentralizedContact = {
          id: key,
          name: data.name,
          publicKey: data.publicKey,
          addedAt: data.addedAt
        };

        setContacts(prev => {
          const existing = prev.find(c => c.id === key);
          if (existing) {
            return prev.map(c => c.id === key ? contact : c);
          }
          return [...prev, contact].sort((a, b) => b.addedAt - a.addedAt);
        });
      }
    });
  }, [currentUser]);

  // Charger les données au démarrage
  useEffect(() => {
    if (currentUser && !loading) {
      loadConversations();
      loadContacts();
    }
  }, [currentUser, loading, loadConversations, loadContacts]);

  return {
    messages,
    conversations,
    contacts,
    currentUser,
    loading,
    activeConversation,
    setActiveConversation,
    loadMessages,
    sendMessage,
    createConversation,
    addContact,
    loadConversations,
    loadContacts
  };
};
