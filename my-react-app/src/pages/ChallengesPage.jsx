import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { 
    listActiveChallenges, 
    participateInChallenge, 
    completeChallenge,
    listAvailableGames // To get game details for challenge cards
} from '../services/gameService'; // Adjust path
import { Timestamp } from 'firebase/firestore'; // For date formatting

// Helper to format challenge dates
const formatChallengeDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Challenge Card Component (local or can be moved)
const ChallengeCard = ({ challenge, onParticipate, onComplete, gameDetails, currentUserId }) => {
  if (!challenge) return null;

  const gameTitle = gameDetails?.[challenge.gameId]?.title || 'A Game';
  const gameIcon = gameDetails?.[challenge.gameId]?.iconUrl || 'https://via.placeholder.com/80?text=Game';
  
  const isParticipating = challenge.participants?.includes(currentUserId);
  const isCompleted = challenge.completedBy?.includes(currentUserId);
  const now = Timestamp.now();
  const hasEnded = challenge.endTime.toDate() < now.toDate();


  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden border-l-4 ${
        isCompleted ? 'border-green-500' 
        : isParticipating ? 'border-blue-500' 
        : hasEnded ? 'border-gray-400 opacity-70'
        : 'border-indigo-500'
    }`}>
      <div className="p-5">
        <div className="flex items-start space-x-4">
            <img src={gameIcon} alt={`${gameTitle} icon`} className="w-16 h-16 rounded-md object-cover flex-shrink-0"/>
            <div>
                <h3 className="text-lg font-semibold text-gray-800" title={challenge.title}>
                {challenge.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                For: <span className="font-medium">{gameTitle}</span>
                </p>
                <p className="text-xs text-gray-500">
                Ends: {formatChallengeDate(challenge.endTime)} (Reward: {challenge.rewardPoints} LP)
                </p>
            </div>
        </div>
        
        <p className="text-sm text-gray-600 my-3">
          {challenge.description} (Target: {challenge.targetScore.toLocaleString()})
        </p>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          {isCompleted ? (
            <p className="text-sm font-semibold text-green-600 text-center">🎉 Challenge Completed! 🎉</p>
          ) : hasEnded ? (
            <p className="text-sm font-semibold text-gray-500 text-center">Challenge has ended.</p>
          ) : isParticipating ? (
            <button
              onClick={() => onComplete(challenge.id)}
              className="w-full bg-green-500 text-white text-sm py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Mark as Completed (Simulated)
            </button>
          ) : (
            <button
              onClick={() => onParticipate(challenge.id)}
              className="w-full bg-indigo-600 text-white text-sm py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Participate in Challenge
            </button>
          )}
           <p className="text-xs text-gray-400 mt-2 text-center">
            {challenge.participants?.length || 0} participant(s)
            {isCompleted && `, ${challenge.completedBy?.length || 0} completed.`}
          </p>
        </div>
      </div>
    </div>
  );
};


const ChallengesPage = () => {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [gameDetailsMap, setGameDetailsMap] = useState({}); // Store game details by gameId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChallengesAndGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const activeChallenges = await listActiveChallenges();
      setChallenges(activeChallenges);

      // Fetch details for games involved in challenges to display names/icons
      if (activeChallenges.length > 0) {
        const gameIds = [...new Set(activeChallenges.map(c => c.gameId))];
        const allGames = await listAvailableGames(); // Assuming this fetches all games
        const detailsMap = allGames.reduce((acc, game) => {
          if (gameIds.includes(game.id)) {
            acc[game.id] = game;
          }
          return acc;
        }, {});
        setGameDetailsMap(detailsMap);
      }

    } catch (err) {
      console.error("Error fetching challenges or game details:", err);
      setError("Failed to load challenges. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallengesAndGames();
  }, [fetchChallengesAndGames]);

  const handleParticipate = async (challengeId) => {
    if (!currentUser?.uid) {
      alert("Please log in to participate in challenges.");
      return;
    }
    try {
      await participateInChallenge(challengeId, currentUser.uid);
      alert("You are now participating in the challenge! (Simulated)");
      // Refresh challenges to reflect participation (if backend updates immediately)
      // For simulated service, manually update state or re-fetch
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId ? {...c, participants: [...(c.participants || []), currentUser.uid]} : c
      );
      setChallenges(updatedChallenges);
    } catch (err) {
      alert(`Error participating in challenge: ${err.message}`);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
     if (!currentUser?.uid) {
      alert("Please log in to complete challenges.");
      return;
    }
    try {
      await completeChallenge(challengeId, currentUser.uid); // This also simulates LuvviX point update
      alert("Challenge marked as completed! (Simulated - LuvviX points awarded if applicable)");
      // Refresh or update state
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId ? {...c, completedBy: [...(c.completedBy || []), currentUser.uid]} : c
      );
      setChallenges(updatedChallenges);
    } catch (err) {
      alert(`Error completing challenge: ${err.message}`);
    }
  };


  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading challenges...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🏅 Weekly Challenges 🏅</h1>
      
      {challenges.length === 0 ? (
        <p className="text-center text-gray-500">No active challenges at the moment. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map(challenge => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              onParticipate={handleParticipate}
              onComplete={handleCompleteChallenge}
              gameDetails={gameDetailsMap}
              currentUserId={currentUser?.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengesPage;
