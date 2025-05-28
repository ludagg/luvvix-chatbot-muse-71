import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from './firebase';
// For getGlobalLuvviXLeaderboard, we might need to query 'users' collection directly
// or have a dedicated function in profileService (which is cleaner).
// For now, let's assume we can query 'users' here for simplicity if profileService doesn't expose it.

// --- Simulated Game Data (to be replaced by Firestore fetching) ---
const SIMULATED_GAMES = [
  { id: 'game1', gameId: 'game1', title: 'Puzzle Pop', description: 'Match colorful bubbles!', iconUrl: 'https://via.placeholder.com/100?text=PuzzlePop', genre: 'Puzzle', type: 'solo' },
  { id: 'game2', gameId: 'game2', title: 'Space Shooter X', description: 'Defend the galaxy.', iconUrl: 'https://via.placeholder.com/100?text=SpaceShooter', genre: 'Action', type: 'solo' },
  { id: 'game3', gameId: 'game3', title: 'Strategy Masters', description: 'Conquer the board.', iconUrl: 'https://via.placeholder.com/100?text=StrategyMasters', genre: 'Strategy', type: 'multijoueur' },
  { id: 'game4', gameId: 'game4', title: 'Word Finder Pro', description: 'Find hidden words.', iconUrl: 'https://via.placeholder.com/100?text=WordFinder', genre: 'Puzzle', type: 'solo' },
];

const SIMULATED_CHALLENGES = [
  { 
    id: 'challenge1', challengeId: 'challenge1', gameId: 'game1', title: 'Puzzle Pop High Score', 
    description: 'Get the highest score in Puzzle Pop this week!', targetScore: 10000, rewardPoints: 50, 
    startTime: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
    endTime: Timestamp.fromDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)), // 4 days from now
    participants: [], completedBy: [] 
  },
  { 
    id: 'challenge2', challengeId: 'challenge2', gameId: 'game2', title: 'Galaxy Defender Ace', 
    description: 'Survive 5 waves in Space Shooter X.', targetScore: 5, rewardPoints: 75, // Target score here means "waves"
    startTime: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
    endTime: Timestamp.fromDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)), // 6 days from now
    participants: [], completedBy: []
  },
];

// In-memory store for game scores for simulation if Firestore is too slow/complex for turn
let SIMULATED_GAME_SCORES = [
    // Example initial scores
    { scoreId: 's1', gameId: 'game1', userId: 'user_test_1', displayName: 'Alice', score: 8500, achievedAt: Timestamp.now() },
    { scoreId: 's2', gameId: 'game1', userId: 'user_test_2', displayName: 'Bob', score: 9200, achievedAt: Timestamp.now() },
    { scoreId: 's3', gameId: 'game2', userId: 'user_test_1', displayName: 'Alice', score: 3, achievedAt: Timestamp.now() },
];


/**
 * Lists all available games.
 * (Simulated: Returns a static list. Real implementation would fetch from Firestore 'games' collection).
 * @returns {Promise<Array<object>>} Array of game objects.
 */
export const listAvailableGames = async () => {
  console.log("Simulating fetch of available games.");
  // Real implementation:
  // const gamesRef = collection(db, 'games');
  // const q = query(gamesRef, orderBy('title'));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return Promise.resolve(SIMULATED_GAMES);
};

/**
 * Submits a score for a game.
 * (Simulated: Adds to an in-memory array and logs. Real: Adds to Firestore 'gameScores' collection).
 * @param {string} gameId - ID of the game.
 * @param {string} userId - UID of the user.
 * @param {number} score - The score achieved.
 * @param {string} userDisplayName - Display name of the user (for simulated leaderboard).
 * @returns {Promise<string>} The ID of the new score entry (simulated).
 */
export const submitGameScore = async (gameId, userId, score, userDisplayName = 'Player') => {
  console.log(`Simulating submission of score ${score} for game ${gameId} by user ${userId}`);
  const newScoreEntry = {
    scoreId: `sim_score_${Date.now()}`, // Simulated ID
    gameId,
    userId,
    displayName: userDisplayName, // For simulated leaderboard display
    score,
    achievedAt: Timestamp.now(),
  };
  
  // Real implementation:
  // const scoresRef = collection(db, 'gameScores');
  // const docRef = await addDoc(scoresRef, { gameId, userId, score, achievedAt: serverTimestamp() });
  // return docRef.id;

  SIMULATED_GAME_SCORES.push(newScoreEntry);
  return Promise.resolve(newScoreEntry.scoreId);
};

/**
 * Retrieves the leaderboard for a specific game.
 * (Simulated: Filters and sorts in-memory scores. Real: Queries Firestore 'gameScores').
 * @param {string} gameId - ID of the game.
 * @param {number} count - Max number of scores to fetch.
 * @returns {Promise<Array<object>>} Array of score objects, sorted by score descending.
 */
export const getLeaderboardForGame = async (gameId, count = 10) => {
  console.log(`Simulating fetch of leaderboard for game ${gameId}`);
  // Real implementation:
  // const scoresRef = collection(db, 'gameScores');
  // const q = query(
  //   scoresRef,
  //   where('gameId', '==', gameId),
  //   orderBy('score', 'desc'),
  //   limit(count)
  // );
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const gameScores = SIMULATED_GAME_SCORES
    .filter(s => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
  return Promise.resolve(gameScores);
};

/**
 * Retrieves the global LuvviX leaderboard based on users' luvviXScore.
 * (Simulated: Uses a placeholder or fetches from 'users' collection if profileService allows).
 * @param {number} count - Max number of users to fetch.
 * @returns {Promise<Array<object>>} Array of user profile objects with their luvviXScore, sorted.
 */
export const getGlobalLuvviXLeaderboard = async (count = 10) => {
  console.log("Fetching global LuvviX leaderboard.");
  // This should ideally use profileService or query 'users' collection directly.
  // Real implementation:
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('luvviXScore', 'desc'),
    limit(count)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
      console.error("Error fetching global LuvviX leaderboard:", error);
      // Fallback to simulated data if Firestore query fails (e.g. missing index)
      return Promise.resolve([
          { id: 'user1_placeholder', displayName: 'Global Player 1', luvviXScore: 1500, photoURL: 'https://via.placeholder.com/50?text=GP1' },
          { id: 'user2_placeholder', displayName: 'Global Player 2', luvviXScore: 1200, photoURL: 'https://via.placeholder.com/50?text=GP2' },
      ]);
  }
};

/**
 * Lists active weekly challenges.
 * (Simulated: Returns a static list filtered by current time. Real: Queries Firestore 'challenges').
 * @returns {Promise<Array<object>>} Array of active challenge objects.
 */
export const listActiveChallenges = async () => {
  console.log("Simulating fetch of active challenges.");
  const now = Timestamp.now();
  // Real implementation:
  // const challengesRef = collection(db, 'challenges');
  // const q = query(
  //   challengesRef,
  //   where('startTime', '<=', now), 
  //   // Note: Firestore doesn't support two inequality filters on different fields easily.
  //   // Usually, you'd query where('startTime', '<=', now) and then client-filter for endTime > now,
  //   // or use a composite field like 'isActive' updated by a backend process.
  //   // For simplicity, we'll query by startTime and filter endTime client-side OR assume all fetched are active.
  //   orderBy('endTime', 'asc') // Show challenges ending soonest first
  // );
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.endTime.toDate() > now.toDate());

  return Promise.resolve(
    SIMULATED_CHALLENGES.filter(c => c.startTime.toDate() <= now.toDate() && c.endTime.toDate() > now.toDate())
  );
};

/**
 * User participates in a challenge.
 * (Simulated: Logs action. Real: Updates 'participants' array in Firestore 'challenges' doc).
 * @param {string} challengeId - ID of the challenge.
 * @param {string} userId - UID of the user.
 * @returns {Promise<void>}
 */
export const participateInChallenge = async (challengeId, userId) => {
  console.log(`Simulating user ${userId} participating in challenge ${challengeId}.`);
  // Real implementation:
  // const challengeRef = doc(db, 'challenges', challengeId);
  // await updateDoc(challengeRef, {
  //   participants: arrayUnion(userId)
  // });
  const challenge = SIMULATED_CHALLENGES.find(c => c.id === challengeId);
  if (challenge && !challenge.participants.includes(userId)) {
    challenge.participants.push(userId);
  }
  return Promise.resolve();
};

/**
 * Marks a challenge as completed by a user.
 * (Simulated: Logs action and updates luvviXScore. Real: Updates 'completedBy' and user's score).
 * @param {string} challengeId - ID of the challenge.
 * @param {string} userId - UID of the user.
 * @returns {Promise<void>}
 */
export const completeChallenge = async (challengeId, userId) => {
  console.log(`Simulating user ${userId} completing challenge ${challengeId}.`);
  const challenge = SIMULATED_CHALLENGES.find(c => c.id === challengeId);
  if (challenge) {
    if (!challenge.completedBy.includes(userId)) {
      challenge.completedBy.push(userId);
    }
    // Simulate awarding points
    // Real implementation:
    // const userRef = doc(db, 'users', userId);
    // const userSnap = await getDoc(userRef);
    // if (userSnap.exists()) {
    //   const currentLuvviXScore = userSnap.data().luvviXScore || 0;
    //   await updateDoc(userRef, {
    //     luvviXScore: currentLuvviXScore + (challenge.rewardPoints || 0)
    //   });
    // }
    // Also update challenge document:
    // const challengeRef = doc(db, 'challenges', challengeId);
    // await updateDoc(challengeRef, { completedBy: arrayUnion(userId) });
    console.log(`Awarded ${challenge.rewardPoints} LuvviX points (simulated) to user ${userId}.`);
  }
  return Promise.resolve();
};
