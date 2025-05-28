// This service is mostly simulated for demonstration purposes.
// In a real application, missions and badges would be stored in Firestore,
// and AI/reputation logic would be more complex.

import { auth } from './firebase'; // For getting current user if needed for filtering
import { getUserProfile } from './profileService'; // To get user's completed missions/badges

// --- Simulated Data (would be in Firestore collections) ---

const SIMULATED_MISSIONS_DEFINITION = [
  { 
    missionId: 'mission_post_1', 
    title: 'First Post!', 
    description: 'Share your first thought or picture with the community.', 
    rewardPoints: 50, 
    criteria: { type: 'post_created', count: 1 } // Simulated criteria
  },
  { 
    missionId: 'mission_post_5', 
    title: 'Serial Poster', 
    description: 'Create 5 posts and share your ideas.', 
    rewardPoints: 150, 
    criteria: { type: 'post_created', count: 5 } 
  },
  { 
    missionId: 'mission_friend_1', 
    title: 'Friendly Beginnings', 
    description: 'Add your first friend.', 
    rewardPoints: 75, 
    criteria: { type: 'friend_added', count: 1 } 
  },
  {
    missionId: 'mission_join_group_1',
    title: 'Community Explorer',
    description: 'Join your first group and see what\'s new.',
    rewardPoints: 100,
    criteria: { type: 'group_joined', count: 1 }
  },
  {
    missionId: 'mission_react_post_3',
    title: 'Engaged Reactor',
    description: 'React to 3 different posts.',
    rewardPoints: 60,
    criteria: { type: 'post_reacted', count: 3 }
  }
];

const SIMULATED_BADGES_DEFINITION = [
  { 
    badgeId: 'badge_newbie', 
    name: 'Newbie', 
    description: 'Welcome! You\'ve joined the LuvviX community.', 
    iconUrl: 'https://via.placeholder.com/50/A7F3D0/065F46?text=N', // Greenish for newbie
    criteria: { type: 'account_created' } // Awarded on profile creation (simulated check)
  },
  { 
    badgeId: 'badge_level_5', 
    name: 'Level 5 Reached', 
    description: 'You\'ve reached Level 5! Keep it up!', 
    iconUrl: 'https://via.placeholder.com/50/BFDBFE/4C1D95?text=L5', // Purplish
    criteria: { type: 'level_reached', level: 5 } 
  },
  { 
    badgeId: 'badge_level_10', 
    name: 'Level 10 Star', 
    description: 'Wow, Level 10! You\'re a star!', 
    iconUrl: 'https://via.placeholder.com/50/FDE68A/78350F?text=L10', // Goldish
    criteria: { type: 'level_reached', level: 10 } 
  },
  {
    badgeId: 'badge_social_butterfly',
    name: 'Social Butterfly',
    description: 'Made 5 friends!',
    iconUrl: 'https://via.placeholder.com/50/FBCFE8/701A75?text=SB', // Pinkish
    criteria: { type: 'friends_count', count: 5 }
  },
  {
    badgeId: 'badge_active_commenter',
    name: 'Active Commenter',
    description: 'Commented on 10 posts.',
    iconUrl: 'https://via.placeholder.com/50/A5F3FC/0E7490?text=AC', // Cyan
    criteria: { type: 'comments_made', count: 10 }
  }
];


/**
 * Lists available missions for a user (missions they haven't completed).
 * (Simulated: Filters a static list based on user's completedMissions).
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array<object>>} Array of available mission objects.
 */
export const listAvailableMissions = async (userId) => {
  console.log(`Simulating listing available missions for user: ${userId}`);
  if (!userId) return SIMULATED_MISSIONS_DEFINITION; // Show all if no user context

  const userProfile = await getUserProfile(userId);
  const completedMissions = userProfile?.completedMissions || [];
  
  const available = SIMULATED_MISSIONS_DEFINITION.filter(
    mission => !completedMissions.includes(mission.missionId)
  );
  return Promise.resolve(available);
};

/**
 * Lists available badges for a user (badges they haven't earned).
 * (Simulated: Filters a static list based on user's earned badges).
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array<object>>} Array of available badge definition objects.
 */
export const listAvailableBadges = async (userId) => {
  console.log(`Simulating listing available badges for user: ${userId}`);
  if (!userId) return SIMULATED_BADGES_DEFINITION;

  const userProfile = await getUserProfile(userId);
  const earnedBadges = userProfile?.badges || []; // Array of { badgeId, ... }
  const earnedBadgeIds = earnedBadges.map(b => b.badgeId);

  const available = SIMULATED_BADGES_DEFINITION.filter(
    badgeDef => !earnedBadgeIds.includes(badgeDef.badgeId)
  );
  return Promise.resolve(available);
};

/**
 * Gets simulated AI-driven reputation insights for a user.
 * @param {string} userId - UID of the user.
 * @returns {Promise<object>} Object with reputation insights.
 */
export const getReputationInsights = async (userId) => {
  console.log(`Simulating reputation insights for user: ${userId}`);
  // This would involve complex AI analysis in a real system.
  // Here, we return static or slightly varied simulated data.
  const userProfile = await getUserProfile(userId);
  const score = userProfile?.luvviXScore || 0;

  let contribution = "Moyenne";
  if (score > 5000) contribution = "Très Haute";
  else if (score > 1000) contribution = "Haute";
  else if (score < 100) contribution = "Basse";
  
  const insights = {
    overallReputation: score > 500 ? "Positive" : "Neutre",
    contributionLevel: contribution,
    socialBehavior: "Positif", // Could be based on flags, reports, etc.
    trustIndex: Math.min(Math.floor(score / 100), 100), // Scale of 0-100
    lastAssessed: Timestamp.now(),
    // Example sentiment analysis (purely simulated)
    recentPostSentiment: "Neutre (Analyse simulée)",
    recentCommentSentiment: "Positif (Analyse simulée)",
  };
  return Promise.resolve(insights);
};

/**
 * Simulates a response from an AI Social Assistant.
 * @param {string} prompt - The user's command/question.
 * @returns {Promise<string>} A simulated response.
 */
export const getAiSocialAssistantResponse = async (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  console.log(`AI Assistant received prompt: "${prompt}"`);

  if (lowerPrompt.includes("bonjour") || lowerPrompt.includes("salut")) {
    return "Bonjour ! Comment puis-je vous aider aujourd'hui sur LuvviX ?";
  } else if (lowerPrompt.includes("crée un post") || lowerPrompt.includes("publie")) {
    const topicMatch = lowerPrompt.match(/(?:sur|concernant|à propos de|de)\s+(.+)/);
    const topic = topicMatch ? topicMatch[1] : "un sujet intéressant";
    return `Post simulé créé : "Je pense que ${topic} est vraiment important. Qu'en pensez-vous ? #discussion #${topic.replace(/\s+/g, '')}" (Ceci est une simulation).`;
  } else if (lowerPrompt.includes("suggère un ami")) {
    return "Suggestion d'ami simulée : Vous devriez vous connecter avec @UtilisateurExemple ! Ils partagent vos intérêts pour la technologie. (Ceci est une simulation).";
  } else if (lowerPrompt.includes("quel temps fait-il") || lowerPrompt.includes("météo")) {
    return "Assistant IA Social : Je ne suis pas un assistant météo, mais j'espère que vous avez du beau temps ! Concentrons-nous sur vos interactions sociales. 😉";
  } else if (lowerPrompt.includes("comment va") || lowerPrompt.includes("ça va")) {
    return "Je suis une IA, donc je vais toujours bien ! Prêt à vous aider à améliorer votre expérience sociale.";
  } else if (lowerPrompt.includes("aide") || lowerPrompt.includes("help")) {
    return "Vous pouvez me demander de 'créer un post sur [sujet]', 'suggérer un ami', ou simplement discuter. Comment puis-je vous assister ?";
  } else {
    return `Réponse simulée à votre demande : "${prompt}". Je suis encore en apprentissage pour mieux comprendre cela. Essayez "aide" pour voir ce que je peux faire.`;
  }
};

// Helper function to get a specific mission definition (simulated)
export const getMissionDetails = async (missionId) => {
    return Promise.resolve(SIMULATED_MISSIONS_DEFINITION.find(m => m.missionId === missionId));
};

// Helper function to get a specific badge definition (simulated)
export const getBadgeDefinition = async (badgeId) => {
    return Promise.resolve(SIMULATED_BADGES_DEFINITION.find(b => b.badgeId === badgeId));
};

// Function to check and award badges based on criteria (simulated)
// This would be called after relevant actions (e.g., level up, friend added).
export const checkAndAwardBadges = async (userId) => {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return;

    const availableBadges = await listAvailableBadges(userId); // Badges user doesn't have

    for (const badge of availableBadges) {
        let criteriaMet = false;
        if (badge.criteria.type === 'level_reached' && userProfile.level >= badge.criteria.level) {
            criteriaMet = true;
        } else if (badge.criteria.type === 'friends_count' && userProfile.friends.length >= badge.criteria.count) {
            criteriaMet = true;
        }
        // Add more criteria checks here: 'account_created', 'comments_made', etc.
        // For 'account_created', it might be awarded right after profile creation.

        if (criteriaMet) {
            // Award the badge (this function is in profileService, but we call it here for logic)
            // This creates a slight circular dependency if profileService also calls engagementService.
            // Better: This logic could be in a higher-order service or triggered by events.
            // For now, we'll simulate the call.
            console.log(`SIMULATING: Awarding badge ${badge.badgeId} to ${userId} via profileService.awardBadge`);
            // await awardBadge(userId, badge); // This would be the actual call
            // To avoid direct call, we'll just log. The UI will call awardBadge from profileService.
            alert(`🎉 Nouveau Badge Débloqué (Simulé)! 🎉\n\nVous avez gagné le badge : "${badge.name}"!\n"${badge.description}"`);
        }
    }
};
