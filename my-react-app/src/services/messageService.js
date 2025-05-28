import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a media file for a message to Firebase Storage.
 * @param {File} file - The file to upload.
 * @param {string} userId - The user ID of the uploader.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<object>} Object containing mediaType, mediaUrl, and storagePath.
 */
const uploadMessageMedia = async (file, userId, conversationId) => {
  if (!file || !userId || !conversationId) {
    throw new Error("File, userId, and conversationId are required for media upload.");
  }

  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop();
  const storagePath = `messages/${conversationId}/${userId}/${fileId}.${fileExtension}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const mediaUrl = await getDownloadURL(storageRef);

  let mediaType = 'file';
  if (file.type.startsWith('image/')) mediaType = 'image';
  else if (file.type.startsWith('video/')) mediaType = 'video';
  else if (file.type.startsWith('audio/')) mediaType = 'audio';

  return { mediaType, mediaUrl, storagePath };
};

/**
 * Get or create a private conversation between two users.
 * Ensures only one private conversation exists between them.
 * @param {string} userId1 - UID of the first user.
 * @param {string} userId2 - UID of the second user.
 * @returns {Promise<string>} Conversation ID.
 */
export const getOrCreatePrivateConversation = async (userId1, userId2) => {
  if (userId1 === userId2) throw new Error("Cannot create a conversation with oneself.");

  const participants = [userId1, userId2].sort(); // Ensure consistent participant order for querying
  const conversationsRef = collection(db, 'conversations');
  
  // Check if a conversation already exists
  const q = query(
    conversationsRef,
    where('type', '==', 'private'),
    where('participants', '==', participants) // Firestore allows exact match on arrays
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Conversation already exists
    return querySnapshot.docs[0].id;
  } else {
    // Create a new private conversation
    const newConversationData = {
      participants,
      type: 'private',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      archivedBy: [],
      pinnedBy: [],
    };
    const docRef = await addDoc(conversationsRef, newConversationData);
    return docRef.id;
  }
};

/**
 * Creates a new group conversation.
 * @param {string} adminId - UID of the user creating the group (first admin).
 * @param {Array<string>} initialParticipants - Array of UIDs for initial members (including admin).
 * @param {object} groupInfo - { name, photoURL (optional) }.
 * @returns {Promise<string>} Conversation ID.
 */
export const createGroupConversation = async (adminId, initialParticipants, groupInfo) => {
  if (!groupInfo || !groupInfo.name) throw new Error("Group name is required.");
  if (!initialParticipants.includes(adminId)) initialParticipants.push(adminId);

  const newConversationData = {
    participants: [...new Set(initialParticipants)], // Ensure unique participants
    type: 'group',
    groupInfo: {
      name: groupInfo.name,
      photoURL: groupInfo.photoURL || '', // Default or placeholder group photo
      admins: [adminId],
      // other group settings can go here
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    archivedBy: [],
    pinnedBy: [],
  };
  const docRef = await addDoc(collection(db, 'conversations'), newConversationData);
  return docRef.id;
};

/**
 * Sends a message in a conversation.
 * @param {string} conversationId - ID of the conversation.
 * @param {string} senderId - UID of the sender.
 * @param {object} messageContent - { textContent (optional), mediaFile (optional File object) }.
 * @returns {Promise<string>} Message ID.
 */
export const sendMessage = async (conversationId, senderId, messageContent) => {
  const { textContent, mediaFile } = messageContent;
  if (!textContent && !mediaFile) throw new Error("Message cannot be empty.");

  let mediaInfo = null;
  if (mediaFile) {
    try {
      mediaInfo = await uploadMessageMedia(mediaFile, senderId, conversationId);
    } catch (error) {
      console.error("Error uploading message media:", error);
      throw error; // Propagate error to UI
    }
  }

  const newMessage = {
    conversationId,
    senderId,
    textContent: textContent || '',
    mediaUrl: mediaInfo?.mediaUrl || null,
    mediaType: mediaInfo?.mediaType || null,
    storagePath: mediaInfo?.storagePath || null, // For potential deletion
    timestamp: serverTimestamp(),
    readBy: [senderId], // Sender has implicitly read the message
    // aiSummary and translatedText would be added later, not on initial send
  };

  const messageRef = await addDoc(collection(db, 'messages'), newMessage);

  // Update conversation's lastMessage and updatedAt
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: {
      text: textContent || (mediaInfo ? mediaInfo.mediaType : 'Media sent'),
      senderId,
      timestamp: newMessage.timestamp, // Use serverTimestamp from message for consistency
    },
    updatedAt: newMessage.timestamp, // Use serverTimestamp from message
    // Potentially clear archives for users when a new message arrives, or handle in UI
    // archivedBy: [] // This is one strategy, or let users keep archives.
  });

  return messageRef.id;
};

/**
 * Listens for new messages in a conversation.
 * @param {string} conversationId - ID of the conversation.
 * @param {function} callback - Function to call with new messages array.
 * @returns {function} Unsubscribe function.
 */
export const listenToMessages = (conversationId, callback) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc') // Get messages in chronological order
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    console.error("Error listening to messages:", error);
    // Handle error appropriately
  });
};

/**
 * Marks messages as read by a user in a conversation.
 * @param {string} conversationId - ID of the conversation.
 * @param {string} userId - UID of the user who read the messages.
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId)
    // We fetch all messages for the conversation.
    // In a high-traffic app, you might fetch only unread messages for this user.
  );

  const querySnapshot = await getDocs(q);
  const batch = writeBatch(db);
  querySnapshot.forEach(document => {
    const message = document.data();
    // Check if message exists and if user is not already in readBy (and not the sender of this specific message if already added at send)
    if (message && (!message.readBy || !message.readBy.includes(userId))) {
      const messageRef = doc(db, 'messages', document.id);
      batch.update(messageRef, {
        readBy: arrayUnion(userId)
      });
    }
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};


/**
 * Archives or unarchives a conversation for a user.
 * @param {string} conversationId - ID of the conversation.
 * @param {string} userId - UID of the user.
 * @param {boolean} isArchived - True to archive, false to unarchive.
 */
export const archiveConversation = async (conversationId, userId, isArchived) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    archivedBy: isArchived ? arrayUnion(userId) : arrayRemove(userId),
    updatedAt: serverTimestamp(), // Touch conversation to reflect change in ordering if needed
  });
};

/**
 * Pins or unpins a conversation for a user.
 * @param {string} conversationId - ID of the conversation.
 * @param {string} userId - UID of the user.
 * @param {boolean} isPinned - True to pin, false to unpin.
 */
export const pinConversation = async (conversationId, userId, isPinned) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    pinnedBy: isPinned ? arrayUnion(userId) : arrayRemove(userId),
    updatedAt: serverTimestamp(), // Touch conversation
  });
};

/**
 * Retrieves and listens to a user's conversations.
 * Ordered by Pinned status then by last message timestamp.
 * @param {string} userId - UID of the user.
 * @param {function} callback - Function to call with conversations array.
 * @returns {function} Unsubscribe function.
 */
export const getUserConversations = (userId, callback) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc') // Primary sort by last activity
  );
  // Note: Firestore does not support orderBy on a different field after array-contains if also filtering.
  // Complex sorting (e.g. pinned first, then by date) often needs to be done client-side
  // or by denormalizing a sort key. For now, we sort by updatedAt and handle pinned/archived in client.

  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Client-side sorting for pinned could be done here if needed
    // e.g., conversations.sort((a,b) => (b.pinnedBy?.includes(userId) ? 1 : 0) - (a.pinnedBy?.includes(userId) ? 1 : 0) || b.updatedAt - a.updatedAt);
    callback(conversations);
  }, (error) => {
    console.error("Error listening to user conversations:", error);
  });
};


// --- Simulated AI and Translation Functions ---

/**
 * (Simulated) Gets an AI summary of a conversation.
 * @param {string} conversationId - ID of the conversation.
 * @returns {Promise<string>} A placeholder summary.
 */
export const getAiConversationSummary = async (conversationId) => {
  console.log(`Simulating AI summary for conversation: ${conversationId}`);
  // In a real app, this would call a cloud function or AI service.
  // For now, fetch last few messages and generate a very basic summary.
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    limit(5) // Get last 5 messages for summary
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return "No messages to summarize.";
  const summaryText = snapshot.docs.map(doc => doc.data().textContent).filter(Boolean).join(". ");
  return `Summary of last messages: ${summaryText.substring(0, 100)}...`;
};

/**
 * (Simulated) Translates a message.
 * @param {string} messageText - The text of the message.
 * @param {string} targetLang - Target language code (e.g., 'es', 'fr').
 * @returns {Promise<string>} Placeholder translated text.
 */
export const translateMessageText = async (messageText, targetLang) = {
  console.log(`Simulating translation of "${messageText}" to ${targetLang}`);
  // In a real app, this would call a translation API.
  return `(Translated to ${targetLang}) ${messageText}`;
};
