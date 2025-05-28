import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Creates a new event.
 * @param {string} creatorId - UID of the user creating the event.
 * @param {object} eventData - { title, description, startTime, endTime, location, groupId (optional) }
 * @returns {Promise<string>} The ID of the newly created event.
 */
export const createEvent = async (creatorId, eventData) => {
  if (!creatorId || !eventData.title || !eventData.startTime || !eventData.endTime) {
    throw new Error("Creator ID, title, start time, and end time are required.");
  }

  // Ensure startTime and endTime are Firestore Timestamps if they are not already
  const ensureTimestamp = (dateInput) => {
    if (dateInput instanceof Timestamp) {
      return dateInput;
    }
    // Attempt to convert from ISO string or Date object
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format for startTime or endTime.");
    }
    return Timestamp.fromDate(date);
  };

  const newEvent = {
    creatorId,
    title: eventData.title,
    description: eventData.description || '',
    startTime: ensureTimestamp(eventData.startTime),
    endTime: ensureTimestamp(eventData.endTime),
    location: eventData.location || '',
    groupId: eventData.groupId || null, // Link to a group if it's a group event
    attendees: [creatorId], // Creator automatically attends
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const eventsRef = collection(db, 'events');
  const docRef = await addDoc(eventsRef, newEvent);
  return docRef.id;
};

/**
 * Retrieves event details.
 * @param {string} eventId - ID of the event.
 * @returns {Promise<object|null>} Event data or null if not found.
 */
export const getEventDetails = async (eventId) => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() };
  }
  return null;
};

/**
 * Lists upcoming events.
 * Can be filtered by groupId. If groupId is null, lists global/non-group events.
 * @param {number} count - Max number of events to fetch.
 * @param {string|null} groupId - Optional ID of the group to filter events for.
 * @returns {Promise<Array<object>>} Array of event objects.
 */
export const listUpcomingEvents = async (count = 10, groupId = null) => {
  const eventsRef = collection(db, 'events');
  const now = Timestamp.now(); // Get current Firestore Timestamp

  let q;
  if (groupId) {
    q = query(
      eventsRef,
      where('groupId', '==', groupId),
      where('startTime', '>=', now), // Only future or ongoing events
      orderBy('startTime', 'asc'),
      limit(count)
    );
  } else {
    // For global events, you might also want to filter out group-specific ones explicitly if needed
    // For now, assuming null groupId means it's a general event not tied to a specific group
    q = query(
      eventsRef,
      where('groupId', '==', null), 
      where('startTime', '>=', now),
      orderBy('startTime', 'asc'),
      limit(count)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Allows a user to RSVP to an event.
 * @param {string} eventId - ID of the event.
 * @param {string} userId - UID of the user RSVPing.
 * @param {'attending' | 'not_attending'} status - RSVP status.
 */
export const rsvpToEvent = async (eventId, userId, status = 'attending') => {
  const eventRef = doc(db, 'events', eventId);
  
  // For simplicity, we are just adding to attendees.
  // A more complex system might have separate 'attending', 'interested', 'not_attending' arrays.
  // If status is 'not_attending', we remove them from attendees.
  
  if (status === 'attending') {
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } else if (status === 'not_attending') {
    await updateDoc(eventRef, {
      attendees: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  } else {
    throw new Error("Invalid RSVP status.");
  }
  console.log(`User ${userId} RSVP'd ${status} to event ${eventId}`);
};

/**
 * Lists users attending an event.
 * (This would typically fetch user profiles based on IDs in `attendees` array)
 * For now, it returns the UIDs. A helper like `getProfilesFromIds` from profileService could be used.
 * @param {string} eventId - ID of the event.
 * @returns {Promise<Array<string>>} Array of user UIDs attending.
 */
export const listEventAttendees = async (eventId) => {
  const eventData = await getEventDetails(eventId);
  if (eventData) {
    return eventData.attendees || [];
  }
  return [];
  // To return full profiles:
  // const attendeeIds = eventData.attendees || [];
  // return getProfilesFromIds(attendeeIds); // (getProfilesFromIds would need to be imported or duplicated)
};
