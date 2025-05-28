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
import { db, storage, auth } from './firebase'; // Assuming db, storage, auth are exported
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs for media files

/**
 * Generates a simulated AI summary.
 * @param {string} textContent - The text content of the post.
 * @returns {string} A short summary.
 */
const generateAiSummary = (textContent) => {
  if (!textContent) return '';
  return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
};

/**
 * Uploads a media file to Firebase Storage.
 * @param {File} file - The file to upload.
 * @param {string} userId - The user ID of the uploader.
 * @returns {Promise<object>} Object containing type, url, and thumbnailUrl (if applicable).
 */
const uploadMediaFile = async (file, userId) => {
  if (!file || !userId) throw new Error("File and userId are required for upload.");

  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop();
  const storagePath = `posts/${userId}/${fileId}.${fileExtension}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  let type = 'file'; // Default type
  if (file.type.startsWith('image/')) {
    type = 'image';
  } else if (file.type.startsWith('video/')) {
    type = 'video';
  } else if (file.type.startsWith('audio/')) {
    type = 'audio';
  }

  // Note: Thumbnail generation would typically happen server-side (e.g., via Firebase Functions)
  // or client-side for images before upload if complex. Here, we'll omit actual thumbnail generation
  // and use the main URL as a placeholder if needed, or assume client handles image thumbnails.
  return {
    type,
    url: downloadURL,
    path: storagePath, // Store path for potential deletion
    // thumbnailUrl: type === 'image' ? downloadURL : undefined, // Simplified
  };
};

/**
 * Deletes a media file from Firebase Storage.
 * @param {string} filePath - The path to the file in Firebase Storage.
 */
const deleteMediaFile = async (filePath) => {
    if (!filePath) return;
    const storageRef = ref(storage, filePath);
    try {
        await deleteObject(storageRef);
        console.log(`File deleted from Storage: ${filePath}`);
    } catch (error) {
        // Handle cases where file might not exist or user doesn't have permission
        // For now, log error but don't let it break the whole delete operation
        console.error(`Error deleting file ${filePath} from Storage:`, error);
        if (error.code === 'storage/object-not-found') {
            console.warn(`Attempted to delete non-existent file: ${filePath}`);
        } else {
            throw error; // Re-throw other errors
        }
    }
};


/**
 * Creates a new post in Firestore.
 * @param {object} postData - Data for the post (textContent, tags, poll, visibility).
 * @param {Array<File>} mediaFiles - Array of File objects to upload.
 * @returns {Promise<DocumentReference>} Reference to the newly created post document.
 */
export const createPost = async (postData, mediaFiles = []) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to create a post.");

  const uploadedMedia = [];
  if (mediaFiles && mediaFiles.length > 0) {
    for (const file of mediaFiles) {
      try {
        const mediaInfo = await uploadMediaFile(file, user.uid);
        uploadedMedia.push(mediaInfo);
      } catch (error) {
        console.error("Error uploading a media file:", error);
        // Decide on error handling: stop post creation, or create post without this file?
        // For now, we'll let it throw and be caught by the caller.
        throw error;
      }
    }
  }

  const newPost = {
    userId: user.uid,
    authorDisplayName: user.displayName || user.email?.split('@')[0], // Denormalized for easier display
    authorPhotoURL: user.photoURL || '', // Denormalized
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    textContent: postData.textContent || '',
    media: uploadedMedia, // Array of { type, url, path }
    tags: postData.tags || [],
    links: postData.links || [], // { url, title?, previewImage? }
    poll: postData.poll ? { ...postData.poll, voters: [] } : null, // { question, options: [{text, votes}], voters }
    reactions: {}, // { like: [userId1], love: [userId2] }
    aiSummary: generateAiSummary(postData.textContent),
    visibility: postData.visibility || 'public', // 'public', 'friends', 'private'
    commentCount: 0, // Initialize comment count
  };

  try {
    const docRef = await addDoc(collection(db, 'posts'), newPost);
    console.log("Post created with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error creating post in Firestore:", error);
    // If post creation fails after files are uploaded, they become orphaned.
    // A cleanup mechanism (e.g., Firebase Function) might be needed for orphaned files in production.
    // For now, we'll rely on the error being caught and handled by the form.
    if (uploadedMedia.length > 0) {
        console.warn("Files were uploaded to Storage, but Firestore post creation failed. These files are now orphaned:", uploadedMedia.map(m => m.path));
        // Attempt to delete orphaned files (best effort)
        for (const media of uploadedMedia) {
            await deleteMediaFile(media.path).catch(e => console.error(`Failed to clean up orphaned file ${media.path}:`, e));
        }
    }
    throw error;
  }
};

/**
 * Retrieves a single post by its ID.
 * @param {string} postId - The ID of the post.
 * @returns {Promise<object|null>} The post data or null if not found.
 */
export const getPost = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    return { id: postSnap.id, ...postSnap.data() };
  } else {
    console.log(`No post found with ID: ${postId}`);
    return null;
  }
};

/**
 * Retrieves posts for a general timeline feed (latest public posts).
 * @param {number} count - The number of posts to retrieve.
 * @returns {Promise<Array<object>>} An array of post objects.
 */
export const getPostsForTimeline = async (count = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'public'), // Only public posts
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Retrieves posts by a specific user.
 * @param {string} userId - The UID of the user.
 * @param {number} count - The number of posts to retrieve.
 * @returns {Promise<Array<object>>} An array of post objects.
 */
export const getPostsByUser = async (userId, count = 10) => {
  const postsRef = collection(db, 'posts');
  // This query also needs to consider visibility if posts can be private/friends only
  // For now, assuming a user can see all their own posts, or we only fetch public ones by others
  const q = query(
    postsRef,
    where('userId', '==', userId),
    // Optionally, filter by visibility: where('visibility', 'in', ['public', 'friends']) if querying for others
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Updates an existing post.
 * @param {string} postId - The ID of the post to update.
 * @param {string} userId - The UID of the user attempting the update (must be author).
 * @param {object} updatedData - The data fields to update.
 * @param {Array<File>} newMediaFiles - New media files to add.
 * @param {Array<object>} mediaToRemove - Existing media objects (with 'path' and 'url') to remove.
 * @returns {Promise<void>}
 */
export const updatePost = async (postId, userId, updatedData, newMediaFiles = [], mediaToRemove = []) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) throw new Error("Post not found.");
  if (postSnap.data().userId !== userId) throw new Error("User not authorized to update this post.");

  const dataToUpdate = { ...updatedData, updatedAt: serverTimestamp() };

  // Handle media uploads
  const addedMedia = [];
  if (newMediaFiles && newMediaFiles.length > 0) {
    for (const file of newMediaFiles) {
      const mediaInfo = await uploadMediaFile(file, userId);
      addedMedia.push(mediaInfo);
    }
    dataToUpdate.media = arrayUnion(...addedMedia); // Add new media to existing array
  }
  
  // Handle media removals (from Storage and Firestore array)
  // This is tricky with arrayUnion/arrayRemove for objects.
  // It's often easier to read the current media, filter, add new, then overwrite the media field.
  let finalMediaArray = postSnap.data().media || [];

  if (mediaToRemove && mediaToRemove.length > 0) {
    for (const mediaItem of mediaToRemove) {
      if (mediaItem.path) {
        await deleteMediaFile(mediaItem.path);
      }
    }
    const urlsToRemove = mediaToRemove.map(m => m.url);
    finalMediaArray = finalMediaArray.filter(m => !urlsToRemove.includes(m.url));
  }
  
  finalMediaArray = finalMediaArray.concat(addedMedia);
  dataToUpdate.media = finalMediaArray;


  if (updatedData.textContent && updatedData.textContent !== postSnap.data().textContent) {
    dataToUpdate.aiSummary = generateAiSummary(updatedData.textContent);
  }

  await updateDoc(postRef, dataToUpdate);
};


/**
 * Deletes a post and its associated media from Firebase Storage.
 * @param {string} postId - The ID of the post to delete.
 * @param {string} userId - The UID of the user attempting deletion (must be author).
 * @returns {Promise<void>}
 */
export const deletePost = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    console.warn("Attempted to delete a non-existent post:", postId);
    return; // Or throw new Error("Post not found.");
  }
  
  const postData = postSnap.data();
  if (postData.userId !== userId) {
    throw new Error("User not authorized to delete this post.");
  }

  // Delete media from Storage
  if (postData.media && postData.media.length > 0) {
    for (const mediaItem of postData.media) {
      if (mediaItem.path) { // Ensure 'path' was stored
        await deleteMediaFile(mediaItem.path);
      } else {
        console.warn(`Media item for post ${postId} is missing a 'path' property. Cannot delete from Storage:`, mediaItem.url);
      }
    }
  }

  // Delete post document from Firestore
  await deleteDoc(postRef);
  console.log(`Post ${postId} and its media deleted successfully.`);
};


/**
 * Adds or updates a user's reaction to a post.
 * Ensures a user can only have one reaction type per post.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The UID of the user reacting.
 * @param {string} reactionType - The type of reaction (e.g., 'like', 'love').
 */
export const addOrUpdateReaction = async (postId, userId, reactionType) => {
  const postRef = doc(db, 'posts', postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post does not exist!");
    }

    const postData = postDoc.data();
    const reactions = postData.reactions || {};
    let userHasReacted = false;

    // Check if user has an existing reaction and remove it
    for (const type in reactions) {
      if (reactions[type].includes(userId)) {
        if (type === reactionType) { // User clicked the same reaction again (toggle off)
          reactions[type] = reactions[type].filter(uid => uid !== userId);
          if (reactions[type].length === 0) delete reactions[type]; // Clean up empty reaction arrays
          userHasReacted = true; // Indicates current reaction was removed
        } else { // User changed reaction type
          reactions[type] = reactions[type].filter(uid => uid !== userId);
          if (reactions[type].length === 0) delete reactions[type];
        }
        // Do not set userHasReacted to true here if type !== reactionType,
        // as we want to add the new reaction below.
      }
    }

    // Add the new reaction if it wasn't a toggle-off action
    if (!userHasReacted || (userHasReacted && reactions[reactionType] === undefined)) { // Add if new or was different type
        if (!reactions[reactionType]) {
            reactions[reactionType] = [];
        }
        // Only add if it's not already there (handles the case where loop above removed a different reaction)
        if (!reactions[reactionType].includes(userId)) {
             reactions[reactionType].push(userId);
        }
    }
    
    transaction.update(postRef, { reactions, updatedAt: serverTimestamp() });
  });
};


/**
 * Allows a user to vote in a poll on a post.
 * Ensures a user can vote only once per poll.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The UID of the user voting.
 * @param {number} optionIndex - The index of the option being voted for.
 */
export const voteInPoll = async (postId, userId, optionIndex) => {
  const postRef = doc(db, 'posts', postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post does not exist!");
    }

    const postData = postDoc.data();
    if (!postData.poll) {
      throw new Error("This post does not have a poll.");
    }

    const poll = postData.poll;
    if (poll.voters && poll.voters.includes(userId)) {
      throw new Error("User has already voted in this poll.");
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error("Invalid poll option index.");
    }

    // Increment vote count for the selected option
    poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;

    // Add user to the list of voters
    if (!poll.voters) {
      poll.voters = [];
    }
    poll.voters.push(userId);

    transaction.update(postRef, { poll, updatedAt: serverTimestamp() });
  });
};
