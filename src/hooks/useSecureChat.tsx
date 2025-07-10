
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { encryptionService } from '@/services/encryption-service';

export interface SecureMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string; // Contenu déchiffré
  message_type: 'text' | 'image' | 'file' | 'voice';
  sent_at: string;
  sender_profile?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SecureConversation {
  id: string;
  name?: string; // Nom déchiffré
  conversation_type: 'private' | 'group';
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: SecureParticipant[];
  last_message?: SecureMessage;
}

export interface SecureParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SecureContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  contact_name?: string; // Nom déchiffré
  added_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const useSecureChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SecureConversation[]>([]);
  const [contacts, setContacts] = useState<SecureContact[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: SecureMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isKeysInitialized, setIsKeysInitialized] = useState(false);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);

  // Initialiser les clés de chiffrement
  const initializeKeys = useCallback(async () => {
    if (!user) return;

    try {
      const { publicKey: storedPublicKey, privateKey: storedPrivateKey } = encryptionService.getKeysFromStorage();
      
      if (storedPublicKey && storedPrivateKey) {
        // Clés existantes - les importer
        const privateKeyImported = await encryptionService.importPrivateKey(storedPrivateKey);
        setPrivateKey(privateKeyImported);
        
        // Vérifier si la clé publique est dans la base
        const { data: existingKey } = await supabase
          .from('user_public_keys')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!existingKey) {
          // Sauvegarder la clé publique dans la base
          await supabase
            .from('user_public_keys')
            .insert({
              user_id: user.id,
              public_key: storedPublicKey
            });
        }
      } else {
        // Générer de nouvelles clés
        const keyPair = await encryptionService.generateKeyPair();
        const publicKeyString = await encryptionService.exportPublicKey(keyPair.publicKey);
        const privateKeyString = await encryptionService.exportPrivateKey(keyPair.privateKey);
        
        // Sauvegarder localement
        encryptionService.saveKeysToStorage(publicKeyString, privateKeyString);
        setPrivateKey(keyPair.privateKey);
        
        // Sauvegarder la clé publique dans la base
        await supabase
          .from('user_public_keys')
          .upsert({
            user_id: user.id,
            public_key: publicKeyString
          });
      }
      
      setIsKeysInitialized(true);
    } catch (error) {
      console.error('Error initializing keys:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le chiffrement",
        variant: "destructive"
      });
    }
  }, [user]);

  // Déchiffrer un message
  const decryptMessage = useCallback(async (encryptedContent: string): Promise<string> => {
    if (!privateKey) return '[Message chiffré]';
    
    try {
      return await encryptionService.decryptMessage(encryptedContent, privateKey);
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Erreur de déchiffrement]';
    }
  }, [privateKey]);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user || !isKeysInitialized) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_participants(
            user_id,
            role,
            user_profiles!chat_participants_user_id_fkey(username, full_name, avatar_url)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Déchiffrer les noms des conversations
      const decryptedConversations = await Promise.all(
        (data || []).map(async (conv: any) => {
          let name = conv.encrypted_name;
          if (name && privateKey) {
            try {
              name = await decryptMessage(name);
            } catch {
              name = 'Conversation';
            }
          }
          
          return {
            ...conv,
            name,
            participants: conv.chat_participants || []
          };
        })
      );

      setConversations(decryptedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    }
  }, [user, isKeysInitialized, privateKey, decryptMessage]);

  // Charger les contacts
  const loadContacts = useCallback(async () => {
    if (!user || !isKeysInitialized) return;

    try {
      const { data, error } = await supabase
        .from('user_contacts')
        .select(`
          *,
          user_profiles!user_contacts_contact_user_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      // Déchiffrer les noms des contacts
      const decryptedContacts = await Promise.all(
        (data || []).map(async (contact: any) => {
          let contact_name = contact.encrypted_contact_name;
          if (contact_name && privateKey) {
            try {
              contact_name = await decryptMessage(contact_name);
            } catch {
              contact_name = contact.user_profiles?.full_name || 'Contact';
            }
          }
          
          return {
            ...contact,
            contact_name
          };
        })
      );

      setContacts(decryptedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive"
      });
    }
  }, [user, isKeysInitialized, privateKey, decryptMessage]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isKeysInitialized || !privateKey) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user_profiles!chat_messages_sender_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Déchiffrer les messages
      const decryptedMessages = await Promise.all(
        (data || []).map(async (message: any) => {
          const content = await decryptMessage(message.encrypted_content);
          return {
            ...message,
            content,
            sender_profile: message.user_profiles
          };
        })
      );

      setMessages(prev => ({
        ...prev,
        [conversationId]: decryptedMessages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    }
  }, [isKeysInitialized, privateKey, decryptMessage]);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim() || !isKeysInitialized) return;

    try {
      // Récupérer les clés publiques des participants
      const { data: participants, error: participantsError } = await supabase
        .from('chat_participants')
        .select('user_id, encrypted_public_key')
        .eq('conversation_id', conversationId);

      if (participantsError) throw participantsError;

      // Pour simplifier, on chiffre avec la première clé publique trouvée
      // En production, il faudrait chiffrer pour chaque participant
      const recipientPublicKey = participants?.[0]?.encrypted_public_key;
      if (!recipientPublicKey) throw new Error('Aucune clé publique trouvée');

      const publicKey = await encryptionService.importPublicKey(recipientPublicKey);
      const encryptedContent = await encryptionService.encryptMessage(content.trim(), publicKey);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          encrypted_content: encryptedContent,
          message_type: 'text'
        });

      if (error) throw error;

      // Recharger les messages
      await loadMessages(conversationId);

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  }, [user, isKeysInitialized, loadMessages]);

  // Créer une conversation privée
  const createPrivateConversation = useCallback(async (participantId: string) => {
    if (!user || !isKeysInitialized) return null;

    try {
      // Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          conversation_type: 'private',
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Récupérer les clés publiques
      const { publicKey: myPublicKey } = encryptionService.getKeysFromStorage();
      const { data: participantKey } = await supabase
        .from('user_public_keys')
        .select('public_key')
        .eq('user_id', participantId)
        .single();

      if (!myPublicKey || !participantKey) {
        throw new Error('Clés publiques manquantes');
      }

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { 
            conversation_id: conversation.id, 
            user_id: user.id, 
            role: 'admin',
            encrypted_public_key: myPublicKey
          },
          { 
            conversation_id: conversation.id, 
            user_id: participantId, 
            role: 'member',
            encrypted_public_key: participantKey.public_key
          }
        ]);

      if (participantsError) throw participantsError;

      await loadConversations();
      
      toast({
        title: "Conversation créée",
        description: "Nouvelle conversation privée créée"
      });

      return conversation.id;
    } catch (error) {
      console.error('Error creating private conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [user, isKeysInitialized, loadConversations]);

  // Ajouter un contact
  const addContact = useCallback(async (contactUserId: string, contactName?: string) => {
    if (!user || !isKeysInitialized || !privateKey) return;

    try {
      // Récupérer la clé publique du contact
      const { data: contactKey } = await supabase
        .from('user_public_keys')
        .select('public_key')
        .eq('user_id', contactUserId)
        .single();

      if (!contactKey) {
        throw new Error('Clé publique du contact introuvable');
      }

      // Chiffrer le nom du contact si fourni
      let encryptedContactName = null;
      if (contactName) {
        const publicKey = await encryptionService.importPublicKey(contactKey.public_key);
        encryptedContactName = await encryptionService.encryptMessage(contactName, publicKey);
      }

      const { error } = await supabase
        .from('user_contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          encrypted_contact_name: encryptedContactName,
          encrypted_public_key: contactKey.public_key
        });

      if (error) throw error;

      await loadContacts();
      
      toast({
        title: "Contact ajouté",
        description: "Le contact a été ajouté avec succès"
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le contact",
        variant: "destructive"
      });
    }
  }, [user, isKeysInitialized, privateKey, loadContacts]);

  // Initialisation
  useEffect(() => {
    if (user) {
      initializeKeys();
    }
  }, [user, initializeKeys]);

  useEffect(() => {
    if (isKeysInitialized) {
      setLoading(true);
      Promise.all([
        loadConversations(),
        loadContacts()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [isKeysInitialized, loadConversations, loadContacts]);

  // Real-time pour les nouveaux messages
  useEffect(() => {
    if (!user || !isKeysInitialized) return;

    const messagesChannel = supabase
      .channel('secure_chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        const newMessage = payload.new as any;
        if (newMessage.conversation_id === activeConversation) {
          loadMessages(newMessage.conversation_id);
        }
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, isKeysInitialized, activeConversation, loadMessages, loadConversations]);

  return {
    conversations,
    contacts,
    messages,
    loading,
    activeConversation,
    isKeysInitialized,
    setActiveConversation,
    loadMessages,
    sendMessage,
    createPrivateConversation,
    addContact,
    loadConversations,
    loadContacts
  };
};
