import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // If using React Router
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { 
    submitGameScore, 
    getLeaderboardForGame,
    listAvailableGames // To get game details if not passed as prop
} from '../services/gameService'; // Adjust path
import ProfileCard from '../components/features/profile/ProfileCard'; // Adjust path
import { getUserProfile, listFriends } from '../services/profileService'; // Adjust path

const GamePage = ({ gameIdFromProp, onNavigateBack }) => { // gameIdFromProp for non-router, onNavigateBack to return to hub
  const { currentUser } = useAuth();
  // const { gameId: gameIdFromParams } = useParams(); // For React Router
  // const targetGameId = gameIdFromProp || gameIdFromParams;
  const targetGameId = gameIdFromProp; // Simplified to use prop only for now

  const [gameDetails, setGameDetails] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastScore, setLastScore] = useState(null);
  const [socialBonusActive, setSocialBonusActive] = useState(false);
  
  // Fetch game details and initial leaderboard
  const fetchGameData = useCallback(async () => {
    if (!targetGameId) {
        setError("No game specified.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError('');
    try {
      // Fetch all games and find the one with targetGameId (since getGameById isn't in service)
      const games = await listAvailableGames();
      const currentGame = games.find(g => g.id === targetGameId);
      if (!currentGame) {
        setError("Game not found.");
        setGameDetails(null);
      } else {
        setGameDetails(currentGame);
        const lb = await getLeaderboardForGame(targetGameId, 10);
        setLeaderboard(lb);
      }

      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setCurrentUserProfile(profile);
        // Simulate social bonus check
        const friends = await listFriends(currentUser.uid);
        // Simplified: check if any friend plays any game (not specific to this game)
        if (friends.length > 0) { 
            console.log("Simulated: User has friends, checking if they play this game (not implemented, bonus active).");
            setSocialBonusActive(true); 
        }
      }

    } catch (err) {
      console.error("Error fetching game data:", err);
      setError("Failed to load game data.");
    } finally {
      setLoading(false);
    }
  }, [targetGameId, currentUser]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const handleSimulatePlay = async () => {
    if (!currentUser || !gameDetails) {
      alert("Please log in and select a game.");
      return;
    }
    const score = Math.floor(Math.random() * (gameDetails.title === 'Puzzle Pop' ? 5000 : 100)) + (gameDetails.title === 'Puzzle Pop' ? 5000 : 50); // Random score
    setLastScore(score);
    try {
      await submitGameScore(gameDetails.id, currentUser.uid, score, currentUserProfile?.displayName || currentUser.email);
      alert(`Simulated play: You scored ${score} points! Score submitted.`);
      // Refresh leaderboard
      const lb = await getLeaderboardForGame(gameDetails.id, 10);
      setLeaderboard(lb);
    } catch (err) {
      alert(`Error submitting score: ${err.message}`);
    }
  };


  if (loading && !gameDetails) return <p className="text-center text-gray-500 py-10">Loading game...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!gameDetails) return <p className="text-center text-gray-500 py-10">Game details could not be loaded.</p>;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 text-center">
        {onNavigateBack && (
             <button onClick={onNavigateBack} className="text-indigo-600 hover:text-indigo-800 mb-3 text-sm">
                &larr; Back to Games Hub
            </button>
        )}
        <div className="flex justify-center items-center mb-3">
            <img src={gameDetails.iconUrl} alt={`${gameDetails.title} icon`} className="w-16 h-16 rounded-lg mr-4 shadow-md"/>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{gameDetails.title}</h1>
                <p className="text-sm text-gray-500 capitalize">{gameDetails.genre} • {gameDetails.type}</p>
            </div>
        </div>
        <p className="text-md text-gray-600 max-w-xl mx-auto">{gameDetails.description}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Game Play Area & User Profile */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Play Game (Simulated)</h2>
            <div className="bg-gray-200 h-64 rounded-md flex items-center justify-center text-gray-500 mb-4">
              <p>"Playing {gameDetails.title}"... (Game iframe or component would go here)</p>
            </div>
            <button
              onClick={handleSimulatePlay}
              className="w-full py-3 px-6 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-lg shadow-md"
            >
              Click to Play & Submit Random Score
            </button>
            {lastScore !== null && <p className="text-center mt-3 text-indigo-600 font-medium">You scored: {lastScore}!</p>}
            {socialBonusActive && (
                <p className="text-center mt-2 text-sm text-purple-600 font-semibold animate-pulse">
                    🎉 Social Bonus Active! (Friends also play - simulated) 🎉
                </p>
            )}
          </section>

          {currentUserProfile && (
            <section className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Your Profile</h2>
              <div className="max-w-xs mx-auto"> {/* Constrain ProfileCard width */}
                <ProfileCard profile={currentUserProfile} />
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Leaderboard */}
        <aside className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">🏆 {gameDetails.title} Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <ul className="space-y-3">
              {leaderboard.map((entry, index) => (
                <li key={entry.scoreId || index} className={`p-3 rounded-md flex justify-between items-center ${
                    index === 0 ? 'bg-yellow-100 border-yellow-300 border-l-4' 
                    : index === 1 ? 'bg-gray-100 border-gray-300 border-l-4' 
                    : index === 2 ? 'bg-orange-100 border-orange-300 border-l-4' 
                    : 'bg-gray-50'
                }`}>
                  <span className="font-medium text-gray-700 text-sm">
                    {index + 1}. {entry.displayName || entry.userId.substring(0,6)}
                  </span>
                  <span className="font-bold text-indigo-600 text-sm">{entry.score.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No scores submitted yet for this game.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

GamePage.propTypes = {
    gameIdFromProp: PropTypes.string.isRequired,
    onNavigateBack: PropTypes.func.isRequired, // To go back to GamesHubPage
};

export default GamePage;
