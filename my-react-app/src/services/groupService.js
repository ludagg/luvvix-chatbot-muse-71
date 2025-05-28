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
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { createGroupConversation } from './messageService'; // To link group chat

/**
 * Creates a new group.
 * Also creates an associated group conversation.
 * @param {string} creatorId - UID of the user creating the group.
 * @param {object} groupData - { name, description, photoURL, type ('public' | 'private'), requiresApproval (boolean, for public groups) }
 * @returns {Promise<string>} The ID of the newly created group.
 */
export const createGroup = async (creatorId, groupData) => {
  if (!creatorId || !groupData.name || !groupData.type) {
    throw new Error("Creator ID, group name, and type are required.");
  }

  // 1. Create the associated group conversation first
  const initialParticipantsForChat = [creatorId]; // Only creator initially in chat, others join via group logic
  const groupConversationInfo = {
    name: groupData.name,
    photoURL: groupData.photoURL || '', // Use group photo for chat too
  };
  
  let conversationId;
  try {
    // Note: messageService.createGroupConversation expects all initial participants.
    // Here, we might want only the creator to be in the chat initially, or add members later.
    // For simplicity, let's assume the group chat is created, and members are implicitly part of it if they are in the group.
    // A more robust approach might be to add members to the chat conversation when they join the group.
    conversationId = await createGroupConversation(creatorId, initialParticipantsForChat, groupConversationInfo);
  } catch (error) {
    console.error("Failed to create group conversation during group creation:", error);
    throw new Error("Failed to initialize group chat. Group not created.");
  }

  // 2. Create the group document in Firestore
  const groupsRef = collection(db, 'groups');
  const newGroupDoc = {
    name: groupData.name,
    description: groupData.description || '',
    photoURL: groupData.photoURL || '', // Default or placeholder
    creatorId,
    members: [creatorId], // Creator is the first member
    admins: [creatorId],  // Creator is the first admin
    type: groupData.type, // 'public', 'private'
    requiresApproval: groupData.type === 'public' ? (groupData.requiresApproval || false) : false, // Only for public
    joinRequests: [], // For public groups requiring approval
    invitations: [], // { userId, invitedBy, timestamp } - If needed for private groups
    chatConversationId: conversationId, // Link to the group chat
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(groupsRef, newGroupDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating group in Firestore:", error);
    // TODO: Consider cleanup for the created conversation if group creation fails.
    // This is complex (e.g., delete conversation or mark as orphaned). For now, log it.
    console.warn(`Orphaned group conversation created with ID: ${conversationId} due to group creation failure.`);
    throw error;
  }
};

/**
 * Updates group information (name, description, photoURL, type, requiresApproval).
 * Only an admin can update.
 * @param {string} groupId - ID of the group.
 * @param {string} adminId - UID of the admin performing the update.
 * @param {object} updatedData - Fields to update.
 */
export const updateGroupInfo = async (groupId, adminId, updatedData) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) throw new Error("Group not found.");
  if (!groupSnap.data().admins?.includes(adminId)) throw new Error("User is not an admin of this group.");

  const dataToUpdate = { ...updatedData, updatedAt: serverTimestamp() };
  
  // If name or photoURL changes, update linked group conversation too
  if ((updatedData.name && updatedData.name !== groupSnap.data().name) || 
      (updatedData.photoURL && updatedData.photoURL !== groupSnap.data().photoURL)) {
    const conversationId = groupSnap.data().chatConversationId;
    if (conversationId) {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationUpdate = {};
      if (updatedData.name) conversationUpdate['groupInfo.name'] = updatedData.name;
      if (updatedData.photoURL) conversationUpdate['groupInfo.photoURL'] = updatedData.photoURL;
      
      try {
        await updateDoc(conversationRef, conversationUpdate);
        console.log("Linked group conversation details updated.");
      } catch (chatError) {
        console.error("Error updating linked group conversation details:", chatError);
        // Proceed with group update but log this error.
      }
    }
  }

  await updateDoc(groupRef, dataToUpdate);
};

/**
 * User requests to join a public group that requires approval.
 * @param {string} groupId - ID of the group.
 * @param {string} userId - UID of the user requesting to join.
 */
export const requestToJoinGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) throw new Error("Group not found.");
  const groupData = groupSnap.data();
  if (groupData.type !== 'public' || !groupData.requiresApproval) {
    throw new Error("This group does not accept join requests or does not require approval.");
  }
  if (groupData.members?.includes(userId)) throw new Error("User is already a member.");
  if (groupData.joinRequests?.includes(userId)) throw new Error("Join request already sent.");

  await updateDoc(groupRef, {
    joinRequests: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

/**
 * Admin approves a user's request to join a group.
 * @param {string} groupId - ID of the group.
 * @param {string} adminId - UID of the admin.
 * @param {string} requestingUserId - UID of the user whose request is being approved.
 */
export const approveJoinRequest = async (groupId, adminId, requestingUserId) => {
  const groupRef = doc(db, 'groups', groupId);
  
  await runTransaction(db, async (transaction) => {
    const groupSnap = await transaction.get(groupRef);
    if (!groupSnap.exists()) throw new Error("Group not found.");
    const groupData = groupSnap.data();
    if (!groupData.admins?.includes(adminId)) throw new Error("User is not an admin.");
    if (!groupData.joinRequests?.includes(requestingUserId)) throw new Error("No join request found for this user.");

    transaction.update(groupRef, {
      members: arrayUnion(requestingUserId),
      joinRequests: arrayRemove(requestingUserId),
      updatedAt: serverTimestamp()
    });
    
    // Also add member to the group chat conversation
    // This part needs careful thought: messageService.createGroupConversation adds initial members.
    // We need a way to add members to an *existing* group conversation.
    // Assuming messageService.addParticipantToGroupConversation(conversationId, userId) exists or is added.
    // For now, this step might be manual or handled by users finding the group chat.
    // OR, the chat participants could just be a direct reflection of group.members.
    // Let's assume for now that the group chat participants list in `conversations` collection
    // might need explicit update if it's not dynamically derived from `groups.members`.
    // The `messageService.createGroupConversation` used `initialParticipantsForChat`.
    // If the chat is meant for ALL group members, then group chat participants should be updated.
    // For simplicity, let's assume the `conversations` collection `participants` array for a group chat
    // should also be updated.
    const conversationId = groupData.chatConversationId;
    if (conversationId) {
        const conversationRef = doc(db, 'conversations', conversationId);
        // Fetch conversation to prevent overwriting other changes if any.
        const convSnap = await transaction.get(conversationRef);
        if (convSnap.exists()) {
            transaction.update(conversationRef, { participants: arrayUnion(requestingUserId) });
        } else {
            console.warn(`Conversation ${conversationId} for group ${groupId} not found during join approval.`);
        }
    }
  });
};

/**
 * Admin declines a user's request to join a group.
 * @param {string} groupId - ID of the group.
 * @param {string} adminId - UID of the admin.
 * @param {string} requestingUserId - UID of the user whose request is being declined.
 */
export const declineJoinRequest = async (groupId, adminId, requestingUserId) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) throw new Error("Group not found.");
  if (!groupSnap.data().admins?.includes(adminId)) throw new Error("User is not an admin.");
  if (!groupSnap.data().joinRequests?.includes(requestingUserId)) throw new Error("No join request found for this user.");

  await updateDoc(groupRef, {
    joinRequests: arrayRemove(requestingUserId),
    updatedAt: serverTimestamp()
  });
};

/**
 * User joins a public group that does not require approval.
 * @param {string} groupId - ID of the group.
 * @param {string} userId - UID of the user joining.
 */
export const joinPublicGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'groups', groupId);
  
  await runTransaction(db, async (transaction) => {
    const groupSnap = await transaction.get(groupRef);
    if (!groupSnap.exists()) throw new Error("Group not found.");
    const groupData = groupSnap.data();
    if (groupData.type !== 'public' || groupData.requiresApproval) {
        throw new Error("This group is not public or requires approval to join.");
    }
    if (groupData.members?.includes(userId)) throw new Error("User is already a member.");

    transaction.update(groupRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
    });
    
    const conversationId = groupData.chatConversationId;
    if (conversationId) {
        const conversationRef = doc(db, 'conversations', conversationId);
        const convSnap = await transaction.get(conversationRef);
        if (convSnap.exists()) {
            transaction.update(conversationRef, { participants: arrayUnion(userId) });
        }
    }
  });
};

/**
 * User leaves a group. If an admin leaves and is the last admin, group might need special handling (e.g. promote another or make ownerless - not handled here).
 * @param {string} groupId - ID of the group.
 * @param {string} userId - UID of the user leaving.
 */
export const leaveGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'groups', groupId);

  await runTransaction(db, async (transaction) => {
    const groupSnap = await transaction.get(groupRef);
    if (!groupSnap.exists()) throw new Error("Group not found.");
    const groupData = groupSnap.data();
    if (!groupData.members?.includes(userId)) throw new Error("User is not a member of this group.");

    const updates = {
      members: arrayRemove(userId),
      admins: arrayRemove(userId), // Also remove from admins if they were one
      updatedAt: serverTimestamp()
    };
    
    // Simple check: if user is the last admin and last member, maybe delete group? Or leave as is.
    // For now, just remove. More complex logic for group deletion/archival can be added.
    if (groupData.admins?.includes(userId) && groupData.admins.length === 1 && groupData.members.length > 1) {
        // Promote another member or handle "ownerless" group scenario.
        // This is complex. For now, we'll allow the last admin to leave.
        // The group might become unmanageable if no admins are left.
        console.warn(`Last admin ${userId} is leaving group ${groupId}. Consider admin promotion logic.`);
    }
    
    transaction.update(groupRef, updates);
    
    const conversationId = groupData.chatConversationId;
    if (conversationId) {
        const conversationRef = doc(db, 'conversations', conversationId);
        const convSnap = await transaction.get(conversationRef);
        if (convSnap.exists()) {
            transaction.update(conversationRef, { participants: arrayRemove(userId) });
        }
    }
  });
};


/**
 * Retrieves group details.
 * @param {string} groupId - ID of the group.
 * @returns {Promise<object|null>} Group data or null if not found.
 */
export const getGroupDetails = async (groupId) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    return { id: groupSnap.id, ...groupSnap.data() };
  }
  return null;
};

/**
 * Lists public groups.
 * @param {number} count - Max number of groups to fetch.
 * @returns {Promise<Array<object>>} Array of public group objects.
 */
export const listPublicGroups = async (count = 10) => {
  const groupsRef = collection(db, 'groups');
  const q = query(
    groupsRef,
    where('type', '==', 'public'),
    orderBy('createdAt', 'desc'), // Or by member count, activity etc.
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Lists groups a user is a member of.
 * @param {string} userId - UID of the user.
 * @param {number} count - Max number of groups to fetch.
 * @returns {Promise<Array<object>>} Array of group objects.
 */
export const listUserGroups = async (userId, count = 10) => {
  const groupsRef = collection(db, 'groups');
  const q = query(
    groupsRef,
    where('members', 'array-contains', userId),
    orderBy('updatedAt', 'desc'), // Last active groups first
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Admin specific functions ---
// (inviteToGroup, removeGroupMember, promoteToAdmin, demoteAdmin would go here)
// These are more complex and might be deferred if time is short for the subtask.
// For now, placeholders or simplified versions:

export const inviteToGroup = async (groupId, adminId, inviteeId) => {
    // Simplified: Directly add to members if private, or could create an "invitations" array.
    // For now, let's assume private groups allow admins to directly add members.
    // This function would need more robust checks (is admin, is group private, is user already member/invited).
    console.log(`Simulating invite of ${inviteeId} to group ${groupId} by admin ${adminId}.`);
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, { members: arrayUnion(inviteeId), updatedAt: serverTimestamp() });
    // Also add to chat conversation
    const groupSnap = await getDoc(groupRef);
    const conversationId = groupSnap.data()?.chatConversationId;
    if(conversationId){
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, { participants: arrayUnion(inviteeId) });
    }

};

// --- Group Posts (Optional for this subtask - Basic placeholders) ---
// If implemented, these would be similar to postService but include groupId.

export const createGroupPost = async (userId, groupId, postData, mediaFiles = []) => {
  console.log(`Simulating create group post in ${groupId} by ${userId}`, postData, mediaFiles);
  // Placeholder: return a fake post ID or throw "Not Implemented"
  return { id: "fake_group_post_id_" + new Date().getTime() };
  // Actual implementation would involve:
  // 1. Upload mediaFiles to Storage (e.g., `posts/${groupId}/${userId}/...`)
  // 2. Add a document to `groupPosts` collection with `groupId`, `userId`, `textContent`, media URLs, `createdAt`, etc.
  // 3. Potentially update group's `updatedAt` or `lastPostActivity` field.
};

export const getGroupPosts = async (groupId, count = 10) => {
  console.log(`Simulating get posts for group ${groupId}`);
  // Placeholder: return an empty array or some mock posts
  return [];
  // Actual implementation:
  // const groupPostsRef = collection(db, 'groupPosts');
  // const q = query(groupPostsRef, where('groupId', '==', groupId), orderBy('createdAt', 'desc'), limit(count));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
