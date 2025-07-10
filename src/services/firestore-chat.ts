
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  getDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FirestoreMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  replyTo?: string;
}

export interface FirestoreConversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
    type: string;
  };
  lastActivity: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  unreadCount?: { [userId: string]: number };
}

export class FirestoreChatService {
  // Créer une nouvelle conversation
  static async createConversation(participants: string[], isGroup: boolean = false, groupName?: string): Promise<string> {
    try {
      const conversationData = {
        participants,
        isGroup,
        groupName: groupName || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        unreadCount: participants.reduce((acc, userId) => ({ ...acc, [userId]: 0 }), {})
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur création conversation:', error);
      throw error;
    }
  }

  // Envoyer un message
  static async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' | 'file' | 'voice' = 'text', mediaUrl?: string): Promise<string> {
    try {
      const messageData = {
        conversationId,
        senderId,
        content,
        type,
        mediaUrl: mediaUrl || null,
        timestamp: serverTimestamp(),
        status: 'sent'
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Mettre à jour la conversation avec le dernier message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          content,
          senderId,
          timestamp: serverTimestamp(),
          type
        },
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  // Écouter les conversations d'un utilisateur
  static subscribeToUserConversations(userId: string, callback: (conversations: FirestoreConversation[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const conversations: FirestoreConversation[] = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        } as FirestoreConversation);
      });
      callback(conversations);
    });
  }

  // Écouter les messages d'une conversation
  static subscribeToMessages(conversationId: string, callback: (messages: FirestoreMessage[]) => void, messageLimit: number = 50) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: FirestoreMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as FirestoreMessage);
      });
      callback(messages);
    });
  }

  // Marquer les messages comme lus
  static async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      // Réinitialiser le compteur de messages non lus
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Erreur marquer messages lus:', error);
    }
  }

  // Rechercher des conversations
  static async searchConversations(userId: string, searchTerm: string): Promise<FirestoreConversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);
      const conversations: FirestoreConversation[] = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as FirestoreConversation;
        // Filtrer côté client pour la recherche (Firestore a des limitations sur les requêtes texte)
        if (data.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          conversations.push(data);
        }
      });

      return conversations;
    } catch (error) {
      console.error('Erreur recherche conversations:', error);
      return [];
    }
  }

  // Supprimer une conversation
  static async deleteConversation(conversationId: string) {
    try {
      // Supprimer tous les messages de la conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Supprimer la conversation
      await deleteDoc(doc(db, 'conversations', conversationId));
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
      throw error;
    }
  }

  // Obtenir une conversation par ID
  static async getConversation(conversationId: string): Promise<FirestoreConversation | null> {
    try {
      const docSnap = await getDoc(doc(db, 'conversations', conversationId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreConversation;
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération conversation:', error);
      return null;
    }
  }
}
