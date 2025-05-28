import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, runTransaction, arrayUnion, arrayRemove, collection, where, query, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase'; // Assuming db and auth are exported from firebase.js
import { updateProfile as updateAuthProfile } from 'firebase/auth';

/**
 * Creates a user profile document in Firestore.
 * This function is typically called after a new user signs up.
 * @param {object} user - The Firebase Auth user object.
 * @param {object} additionalData - Any additional data to merge with the default profile.
 */
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user || !user.uid) {
    console.error("User object with UID is required to create a profile.");
    return null;
  }

  const userRef = doc(db, 'users', user.uid);

  const defaultProfileData = {
    userId: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
    photoURL: user.photoURL || '', // Default or placeholder photo URL
    email: user.email, // Store email for reference, though primarily from Auth
    bio: '',
    birthDate: null, // Store as null or a specific format e.g., "YYYY-MM-DD" or Firestore Timestamp
    country: '',
    isVerified: false, // Default to not verified
    onlineStatus: 'offline', // Default status
    luvviXScore: 0,
    level: 1, // New field: Initial level
    badges: [], // New field: Array of { badgeId, name, iconUrl, earnedAt }
    completedMissions: [], // New field: Array of missionIds
    userRole: 'user', // Default role
    aiPreferences: {}, // Default AI preferences
    friends: [],
    friendRequestsSent: [], // New field
    friendRequestsReceived: [], // New field
    subscriptions: [], // Users this user is following
    subscribers: [], // Users following this user
    profilePrivacySettings: { // Default privacy settings
      birthDate: 'private', // 'private', 'friends_only', 'public'
      country: 'public',
      email: 'private', // Email visibility
      photoURL: 'public',
      bio: 'public',
      luvviXScore: 'public',
      onlineStatus: 'public',
    },
    publicData: {}, // Explicitly public data chosen by user
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...additionalData,
  };

  try {
    await setDoc(userRef, defaultProfileData);
    console.log(`User profile created for UID: ${user.uid}`);
    return defaultProfileData;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Retrieves a user's profile data from Firestore.
 * @param {string} userId - The UID of the user.
 * @returns {Promise<object|null>} The user profile data, or null if not found.
 */
export const getUserProfile = async (userId) => {
  if (!userId) {
    console.error("User ID is required to get a profile.");
    return null;
  }
  const userRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log(`No profile found for user ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Updates a user's profile data in Firestore.
 * Also handles updating displayName and photoURL in Firebase Auth if provided.
 * @param {string} userId - The UID of the user.
 * @param {object} data - The data to update.
 *                         If data contains displayName or photoURL, it will also update Firebase Auth.
 */
export const updateUserProfile = async (userId, data) => {
  if (!userId) {
    console.error("User ID is required to update a profile.");
    return;
  }
  const userRef = doc(db, 'users', userId);
  const dataToUpdate = { ...data, updatedAt: serverTimestamp() };

  const { displayName, photoURL, ...firestoreData } = dataToUpdate;

  try {
    // Update Firebase Auth profile if displayName or photoURL are being changed
    const authProfileUpdates = {};
    if (displayName !== undefined && auth.currentUser && auth.currentUser.displayName !== displayName) {
      authProfileUpdates.displayName = displayName;
    }
    if (photoURL !== undefined && auth.currentUser && auth.currentUser.photoURL !== photoURL) {
      authProfileUpdates.photoURL = photoURL;
    }

    if (Object.keys(authProfileUpdates).length > 0 && auth.currentUser && auth.currentUser.uid === userId) {
      await updateAuthProfile(auth.currentUser, authProfileUpdates);
      console.log("Firebase Auth profile updated for displayName/photoURL.");
      // Ensure these are part of the data saved to Firestore as well
      if (displayName !== undefined) firestoreData.displayName = displayName;
      if (photoURL !== undefined) firestoreData.photoURL = photoURL;
    } else {
        // If not updating auth (e.g. admin editing other user, or fields not in auth)
        // still ensure displayName and photoURL from input data are written if present
        if (displayName !== undefined) firestoreData.displayName = displayName;
        if (photoURL !== undefined) firestoreData.photoURL = photoURL;
    }


    // Update Firestore document
    // Only update firestoreData if there's something in it beyond just timestamps or auth fields
    // This check might be too complex or unnecessary if we always update `updatedAt`
    const keysToUpdateInFirestore = Object.keys(firestoreData).filter(key => key !== 'updatedAt' || (key === 'updatedAt' && Object.keys(firestoreData).length > 1));

    if (keysToUpdateInFirestore.length > 0) {
        await updateDoc(userRef, firestoreData);
        console.log(`User profile updated in Firestore for UID: ${userId}`);
    } else if (Object.keys(authProfileUpdates).length > 0 && Object.keys(firestoreData).length <= 1) {
        // This case means only auth profile was updated, and firestoreData only contains 'updatedAt'
        // We still might want to update 'updatedAt' in Firestore.
        // If auth was updated, displayName/photoURL would be in firestoreData already if they existed in original `data`.
        // Let's ensure updatedAt is always set.
        await updateDoc(userRef, { updatedAt: serverTimestamp() });
         console.log(`User profile 'updatedAt' timestamp updated in Firestore for UID: ${userId} after auth update.`);
    }


  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Converts a date string (YYYY-MM-DD) to a Firestore Timestamp.
 * @param {string} dateString - The date string.
 * @returns {Timestamp|null} Firestore Timestamp or null if invalid.
 */
export const dateToTimestamp = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return Timestamp.fromDate(date);
};

/**
 * Converts a Firestore Timestamp to a date string (YYYY-MM-DD).
 * @param {Timestamp} timestamp - The Firestore Timestamp.
 * @returns {string} Date string or empty string if invalid.
 */
export const timestampToDateString = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '';
  try {
    return timestamp.toDate().toISOString().split('T')[0];
  } catch (error) {
    console.error("Error converting timestamp to date string:", error);
    return '';
  }
};

// --- Friend Management Functions ---

/**
 * Sends a friend request from requesterId to recipientId.
 * @param {string} requesterId - UID of the user sending the request.
 * @param {string} recipientId - UID of the user receiving the request.
 */
export const sendFriendRequest = async (requesterId, recipientId) => {
  if (requesterId === recipientId) throw new Error("Cannot send friend request to oneself.");

  const requesterRef = doc(db, 'users', requesterId);
  const recipientRef = doc(db, 'users', recipientId);

  // Check if already friends or request already sent/received
  const requesterDoc = await getDoc(requesterRef);
  const recipientDoc = await getDoc(recipientRef);

  if (!requesterDoc.exists() || !recipientDoc.exists()) {
    throw new Error("One or both users not found.");
  }

  const requesterData = requesterDoc.data();
  if (requesterData.friends?.includes(recipientId)) {
    throw new Error("Already friends.");
  }
  if (requesterData.friendRequestsSent?.includes(recipientId)) {
    throw new Error("Friend request already sent.");
  }
  if (requesterData.friendRequestsReceived?.includes(recipientId)) {
    throw new Error("This user has already sent you a friend request. Please accept or decline it.");
  }


  const batch = writeBatch(db);
  batch.update(requesterRef, { friendRequestsSent: arrayUnion(recipientId), updatedAt: serverTimestamp() });
  batch.update(recipientRef, { friendRequestsReceived: arrayUnion(requesterId), updatedAt: serverTimestamp() });

  await batch.commit();
  console.log(`Friend request sent from ${requesterId} to ${recipientId}`);
};

/**
 * Accepts a friend request.
 * Moves users from request lists to friends list.
 * @param {string} userId - UID of the user accepting the request.
 * @param {string} requesterId - UID of the user who sent the request.
 */
export const acceptFriendRequest = async (userId, requesterId) => {
  const userRef = doc(db, 'users', userId);
  const requesterRef = doc(db, 'users', requesterId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const requesterDoc = await transaction.get(requesterRef);

    if (!userDoc.exists() || !requesterDoc.exists()) {
      throw new Error("User or requester not found.");
    }
    
    // Check if request actually exists
    if (!userDoc.data().friendRequestsReceived?.includes(requesterId)) {
        throw new Error("No friend request found from this user to accept.");
    }
    if (!requesterDoc.data().friendRequestsSent?.includes(userId)) {
        // This indicates data inconsistency, but proceed with user's side if their request exists.
        console.warn(`Inconsistency: Requester ${requesterId} does not have a sent request to ${userId}, but ${userId} has a received request.`);
    }


    // Update for the user accepting the request
    transaction.update(userRef, {
      friends: arrayUnion(requesterId),
      friendRequestsReceived: arrayRemove(requesterId),
      updatedAt: serverTimestamp()
    });

    // Update for the user who sent the request
    transaction.update(requesterRef, {
      friends: arrayUnion(userId),
      friendRequestsSent: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  });
  console.log(`Friend request from ${requesterId} accepted by ${userId}`);
};

/**
 * Declines or cancels a friend request.
 * @param {string} userId - UID of the user declining/cancelling.
 * @param {string} otherUserId - UID of the other user involved in the request.
 * @param {'received' | 'sent'} requestType - Type of request from userId's perspective.
 */
export const declineFriendRequest = async (userId, otherUserId, requestType) => {
  const userRef = doc(db, 'users', userId);
  const otherUserRef = doc(db, 'users', otherUserId);

  const batch = writeBatch(db);

  if (requestType === 'received') { // userId is declining a request received from otherUserId
    batch.update(userRef, { friendRequestsReceived: arrayRemove(otherUserId), updatedAt: serverTimestamp() });
    batch.update(otherUserRef, { friendRequestsSent: arrayRemove(userId), updatedAt: serverTimestamp() });
  } else if (requestType === 'sent') { // userId is cancelling a request sent to otherUserId
    batch.update(userRef, { friendRequestsSent: arrayRemove(otherUserId), updatedAt: serverTimestamp() });
    batch.update(otherUserRef, { friendRequestsReceived: arrayRemove(userId), updatedAt: serverTimestamp() });
  } else {
    throw new Error("Invalid request type. Must be 'received' or 'sent'.");
  }

  await batch.commit();
  console.log(`Friend request between ${userId} and ${otherUserId} was ${requestType === 'received' ? 'declined' : 'cancelled'}.`);
};

/**
 * Removes a friend.
 * @param {string} userId - UID of the user initiating the removal.
 * @param {string} friendId - UID of the friend to remove.
 */
export const removeFriend = async (userId, friendId) => {
  const userRef = doc(db, 'users', userId);
  const friendRef = doc(db, 'users', friendId);

  const batch = writeBatch(db);
  batch.update(userRef, { friends: arrayRemove(friendId), updatedAt: serverTimestamp() });
  batch.update(friendRef, { friends: arrayRemove(userId), updatedAt: serverTimestamp() });

  await batch.commit();
  console.log(`User ${userId} removed ${friendId} as a friend.`);
};

/**
 * Fetches profiles for a list of user IDs.
 * @param {Array<string>} userIds - Array of user IDs.
 * @returns {Promise<Array<object>>} Array of user profile objects.
 */
const getProfilesFromIds = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  // Firestore 'in' query is limited to 10 items. For more, batch queries or fetch one by one.
  // For simplicity here, assuming userIds.length <= 10 or handle pagination/batching in UI.
  // A more robust solution might fetch profiles individually if many, or if more than 10, do multiple 'in' queries.
  
  const profiles = [];
  // Chunk userIds into groups of 10 for 'in' query
  for (let i = 0; i < userIds.length; i += 10) {
      const chunk = userIds.slice(i, i + 10);
      if (chunk.length > 0) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));
      }
  }
  return profiles;
};


/**
 * Lists a user's friends.
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array<object>>} Array of friend profile objects.
 */
export const listFriends = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found.");
  const friendIds = userSnap.data().friends || [];
  return getProfilesFromIds(friendIds);
};

/**
 * Lists a user's friend requests (received or sent).
 * @param {string} userId - UID of the user.
 * @param {'received' | 'sent'} type - Type of requests to list.
 * @returns {Promise<Array<object>>} Array of profile objects for users in requests.
 */
export const listFriendRequests = async (userId, type = 'received') => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found.");
  
  let requestUserIds = [];
  if (type === 'received') {
    requestUserIds = userSnap.data().friendRequestsReceived || [];
  } else if (type === 'sent') {
    requestUserIds = userSnap.data().friendRequestsSent || [];
  } else {
    throw new Error("Invalid type for listFriendRequests. Must be 'received' or 'sent'.");
  }
  
  return getProfilesFromIds(requestUserIds);
};


// --- Subscription Management Functions ---

/**
 * Subscribes subscriberId to targetUserId.
 * @param {string} subscriberId - UID of the user subscribing.
 * @param {string} targetUserId - UID of the user being subscribed to.
 */
export const subscribeToUser = async (subscriberId, targetUserId) => {
  if (subscriberId === targetUserId) throw new Error("Cannot subscribe to oneself.");

  const subscriberRef = doc(db, 'users', subscriberId);
  const targetUserRef = doc(db, 'users', targetUserId);

  const batch = writeBatch(db);
  batch.update(subscriberRef, { subscriptions: arrayUnion(targetUserId), updatedAt: serverTimestamp() });
  batch.update(targetUserRef, { subscribers: arrayUnion(subscriberId), updatedAt: serverTimestamp() });

  await batch.commit();
  console.log(`User ${subscriberId} subscribed to ${targetUserId}`);
};

/**
 * Unsubscribes subscriberId from targetUserId.
 * @param {string} subscriberId - UID of the user unsubscribing.
 * @param {string} targetUserId - UID of the user being unsubscribed from.
 */
export const unsubscribeFromUser = async (subscriberId, targetUserId) => {
  const subscriberRef = doc(db, 'users', subscriberId);
  const targetUserRef = doc(db, 'users', targetUserId);

  const batch = writeBatch(db);
  batch.update(subscriberRef, { subscriptions: arrayRemove(targetUserId), updatedAt: serverTimestamp() });
  batch.update(targetUserRef, { subscribers: arrayRemove(subscriberId), updatedAt: serverTimestamp() });

  await batch.commit();
  console.log(`User ${subscriberId} unsubscribed from ${targetUserId}`);
};

/**
 * Lists users that `userId` is subscribed to (following).
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array<object>>} Array of profile objects for users being followed.
 */
export const listSubscriptions = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found.");
  const subscriptionIds = userSnap.data().subscriptions || [];
  return getProfilesFromIds(subscriptionIds);
};

/**
 * Lists users that are subscribed to `userId` (followers).
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array<object>>} Array of profile objects for followers.
 */
export const listSubscribers = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found.");
  const subscriberIds = userSnap.data().subscribers || [];
  return getProfilesFromIds(subscriberIds);
};

// --- Gamification Functions ---

/**
 * Calculates user level based on LuvviX score.
 * Example: Level = floor(score / 1000) + 1.
 * @param {number} score - The user's LuvviX score.
 * @returns {number} The calculated level.
 */
export const calculateLevel = (score) => {
  return Math.floor(score / 1000) + 1; // Each 1000 points = 1 level, starting at level 1
};

/**
 * Updates user's LuvviX score and recalculates their level.
 * @param {string} userId - UID of the user.
 * @param {number} pointsToAdd - Points to add to the current score.
 * @returns {Promise<{newScore: number, newLevel: number, oldLevel: number}>}
 */
export const updateUserScoreAndLevel = async (userId, pointsToAdd) => {
  if (!userId || typeof pointsToAdd !== 'number') {
    throw new Error("User ID and points to add are required.");
  }

  const userRef = doc(db, 'users', userId);
  let newScore, newLevel, oldLevel;

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found.");
    }

    const userData = userDoc.data();
    const currentScore = userData.luvviXScore || 0;
    oldLevel = userData.level || calculateLevel(currentScore); // Use stored level or calculate if missing

    newScore = currentScore + pointsToAdd;
    newLevel = calculateLevel(newScore);

    transaction.update(userRef, {
      luvviXScore: newScore,
      level: newLevel,
      updatedAt: serverTimestamp()
    });
  });
  
  console.log(`User ${userId} score updated to ${newScore}, level is now ${newLevel} (was ${oldLevel}).`);
  return { newScore, newLevel, oldLevel };
};

/**
 * Awards a badge to a user if they don't already have it.
 * Criteria checking is simulated here.
 * @param {string} userId - UID of the user.
 * @param {object} badge - The badge object { badgeId, name, iconUrl, description, criteria (simulated) }.
 * @returns {Promise<boolean>} True if badge was newly awarded, false if already owned or criteria not met.
 */
export const awardBadge = async (userId, badge) => {
  if (!userId || !badge || !badge.badgeId || !badge.name) {
    throw new Error("User ID and badge information (id, name) are required.");
  }

  const userRef = doc(db, 'users', userId);
  let newlyAwarded = false;

  // Simulate criteria check (e.g., based on badge.criteria)
  // For this simulation, we'll assume criteria are met if function is called.
  console.log(`Simulating criteria check for badge "${badge.name}" for user ${userId}. Assuming met.`);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found.");
    }

    const userData = userDoc.data();
    const existingBadges = userData.badges || [];
    const hasBadge = existingBadges.some(b => b.badgeId === badge.badgeId);

    if (!hasBadge) {
      const newBadgeEntry = {
        badgeId: badge.badgeId,
        name: badge.name,
        iconUrl: badge.iconUrl || '',
        description: badge.description || '', // Store description for easy display
        earnedAt: serverTimestamp()
      };
      transaction.update(userRef, {
        badges: arrayUnion(newBadgeEntry),
        updatedAt: serverTimestamp()
      });
      newlyAwarded = true;
    }
  });

  if (newlyAwarded) {
    console.log(`Badge "${badge.name}" awarded to user ${userId}.`);
  } else {
    console.log(`User ${userId} already has badge "${badge.name}" or criteria not met (simulated).`);
  }
  return newlyAwarded;
};

/**
 * Marks a mission as completed for a user and awards points.
 * @param {string} userId - UID of the user.
 * @param {object} mission - The mission object { missionId, title, rewardPoints }.
 * @returns {Promise<{newScore: number, newLevel: number, oldLevel: number}|null>} Score/level info or null if mission already completed.
 */
export const completeMission = async (userId, mission) => {
  if (!userId || !mission || !mission.missionId || typeof mission.rewardPoints !== 'number') {
    throw new Error("User ID, mission ID, and reward points are required.");
  }

  const userRef = doc(db, 'users', userId);
  let scoreUpdateResult = null;
  let missionNewlyCompleted = false;

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found.");
    }

    const userData = userDoc.data();
    const completedMissions = userData.completedMissions || [];

    if (!completedMissions.includes(mission.missionId)) {
      transaction.update(userRef, {
        completedMissions: arrayUnion(mission.missionId),
        // Points and level update will be handled by calling updateUserScoreAndLevel
        updatedAt: serverTimestamp()
      });
      missionNewlyCompleted = true;
    }
  });

  if (missionNewlyCompleted) {
    console.log(`Mission "${mission.title}" marked as completed for user ${userId}.`);
    scoreUpdateResult = await updateUserScoreAndLevel(userId, mission.rewardPoints);
    return scoreUpdateResult;
  } else {
    console.log(`User ${userId} has already completed mission "${mission.title}". No points awarded.`);
    return null; // Indicate mission was already completed
  }
};
