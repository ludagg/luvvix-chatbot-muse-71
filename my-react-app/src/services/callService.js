import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
  collectionGroup
} from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Creates a new call entry in Firestore with status 'pending'.
 * @param {string} callerId - UID of the user initiating the call.
 * @param {string} calleeId - UID of the user being called.
 * @param {'audio' | 'video'} type - Type of the call.
 * @returns {Promise<string>} The ID of the newly created call document.
 */
export const createCall = async (callerId, calleeId, type) => {
  if (!callerId || !calleeId || !type) {
    throw new Error("CallerId, CalleeId, and call type are required.");
  }
  const callsRef = collection(db, 'calls');
  const callDoc = await addDoc(callsRef, {
    callerId,
    calleeId,
    type,
    status: 'pending', // Initial status
    offer: null,
    answer: null,
    createdAt: serverTimestamp(),
    endedAt: null,
  });
  return callDoc.id;
};

/**
 * Sends (updates) the SDP offer for a call.
 * @param {string} callId - The ID of the call document.
 * @param {RTCSessionDescriptionInit} offerSdp - The SDP offer object.
 */
export const sendOffer = async (callId, offerSdp) => {
  const callRef = doc(db, 'calls', callId);
  await updateDoc(callRef, {
    offer: JSON.parse(JSON.stringify(offerSdp)), // Store as plain object
    // Status might change depending on flow, e.g. 'offering'
  });
};

/**
 * Sends (updates) the SDP answer for a call and changes status to 'answered'.
 * @param {string} callId - The ID of the call document.
 * @param {RTCSessionDescriptionInit} answerSdp - The SDP answer object.
 */
export const sendAnswer = async (callId, answerSdp) => {
  const callRef = doc(db, 'calls', callId);
  await updateDoc(callRef, {
    answer: JSON.parse(JSON.stringify(answerSdp)), // Store as plain object
    status: 'answered', // Call is officially answered once callee sends answer
  });
};

/**
 * Sends an ICE candidate to the Firestore subcollection for the call.
 * @param {string} callId - The ID of the call document.
 * @param {string} senderId - UID of the user sending the candidate.
 * @param {RTCIceCandidateInit | RTCIceCandidate} iceCandidate - The ICE candidate object.
 */
export const sendIceCandidate = async (callId, senderId, iceCandidate) => {
  const candidatesRef = collection(db, 'calls', callId, 'iceCandidates');
  await addDoc(candidatesRef, {
    senderId,
    candidate: JSON.parse(JSON.stringify(iceCandidate)), // Store as plain object
    createdAt: serverTimestamp(), // Optional: for ordering or debugging
  });
};

/**
 * Listens for real-time updates to a call document.
 * (e.g., for offer, answer, status changes).
 * @param {string} callId - The ID of the call document.
 * @param {function} callback - Function to call with the updated call data.
 * @returns {function} Unsubscribe function from onSnapshot.
 */
export const listenToCallUpdates = (callId, callback) => {
  const callRef = doc(db, 'calls', callId);
  return onSnapshot(callRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback({ id: docSnapshot.id, ...docSnapshot.data() });
    } else {
      callback(null); // Call document might have been deleted or ID is wrong
    }
  }, (error) => {
    console.error(`Error listening to call updates for callId ${callId}:`, error);
    // Handle error appropriately in the callback or here
  });
};

/**
 * Listens for new ICE candidates added to a call's subcollection.
 * This is used by each peer to listen for candidates from the other.
 * @param {string} callId - The ID of the call document.
 * @param {string} listeningForSenderId - The UID of the *other* user, whose candidates we are interested in.
 * @param {function} callback - Function to call with new ICE candidate data.
 * @returns {function} Unsubscribe function from onSnapshot.
 */
export const listenToIceCandidates = (callId, listeningForSenderId, callback) => {
  const candidatesRef = collection(db, 'calls', callId, 'iceCandidates');
  // We only want candidates from the other party.
  const q = query(
    candidatesRef,
    where('senderId', '==', listeningForSenderId),
    orderBy('createdAt', 'asc') // Process candidates in order if createdAt is reliable
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data().candidate);
      }
    });
  }, (error) => {
    console.error(`Error listening to ICE candidates for callId ${callId}, sender ${listeningForSenderId}:`, error);
  });
};

/**
 * Updates the status of a call.
 * @param {string} callId - The ID of the call document.
 * @param {'pending' | 'answered' | 'declined' | 'ended' | 'in-progress' | 'failed'} status - The new status.
 */
export const updateCallStatus = async (callId, status) => {
  const callRef = doc(db, 'calls', callId);
  const updateData = { status };
  if (status === 'ended' || status === 'declined' || status === 'failed') {
    updateData.endedAt = serverTimestamp();
  }
  await updateDoc(callRef, updateData);
};

/**
 * Listens for incoming calls for a specific user.
 * Checks for call documents where `calleeId` matches `userId` and `status` is 'pending'.
 * @param {string} userId - UID of the user to listen for incoming calls.
 * @param {function} callback - Function to call with the incoming call data (or null if multiple).
 * @returns {function} Unsubscribe function from onSnapshot.
 */
export const listenForIncomingCalls = (userId, callback) => {
  const callsRef = collection(db, 'calls');
  const q = query(
    callsRef,
    where('calleeId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'), // Get the latest pending call first
    limit(1) // Typically, a user handles one incoming call at a time
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      // Assuming one pending call shown at a time.
      // If multiple pending calls are possible, callback needs to handle an array.
      const callDoc = snapshot.docs[0];
      callback({ id: callDoc.id, ...callDoc.data() });
    } else {
      callback(null); // No pending calls
    }
  }, (error) => {
    console.error(`Error listening for incoming calls for userId ${userId}:`, error);
  });
};

/**
 * Cleans up ICE candidates for a given callId.
 * Useful when a call ends or fails.
 * @param {string} callId - The ID of the call.
 */
export const cleanupIceCandidates = async (callId) => {
    const candidatesRef = collection(db, 'calls', callId, 'iceCandidates');
    const snapshot = await getDocs(candidatesRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`ICE candidates for call ${callId} cleaned up.`);
};

// Note: For a production app, security rules for Firestore would be crucial
// to ensure users can only access/modify call data appropriately.
// e.g., only caller/callee can update certain fields or read candidates.
// Status transitions should also be validated by rules if possible.
