import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { 
    listAvailableGames, 
    getLeaderboardForGame, 
    getGlobalLuvviXLeaderboard 
} from '../services/gameService'; // Adjust path
import ProfileCard from '../components/features/profile/ProfileCard'; // For Global LuvviX Leaderboard

const LeaderboardsPage = () => {
  const { currentUser } = useAuth(); // For context, though leaderboards are mostly public
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingGameLb, setLoadingGameLb] = useState(false);
  const [loadingGlobalLb, setLoadingGlobalLb] = useState(true);
  const [error, setError] = useState('');

  // Fetch available games for the selector
  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const availableGames = await listAvailableGames();
        setGames(availableGames);
        if (availableGames.length > 0) {
          setSelectedGameId(availableGames[0].id); // Default to first game
        }
      } catch (err) {
        setError("Failed to load game list for leaderboards.");
        console.error("Error fetching games for leaderboard selector:", err);
      } finally {
        setLoadingGames(false);
      }
    };
    fetchGames();
  }, []);

  // Fetch leaderboard for the selected game
  useEffect(() => {
    if (!selectedGameId) {
        setGameLeaderboard([]);
        return;
    }
    const fetchGameLb = async () => {
      setLoadingGameLb(true);
      try {
        const lb = await getLeaderboardForGame(selectedGameId, 10);
        setGameLeaderboard(lb);
      } catch (err) {
        setError(`Failed to load leaderboard for game ID ${selectedGameId}.`);
        console.error(`Error fetching leaderboard for ${selectedGameId}:`, err);
      } finally {
        setLoadingGameLb(false);
      }
    };
    fetchGameLb();
  }, [selectedGameId]);

  // Fetch global LuvviX leaderboard
  useEffect(() => {
    const fetchGlobalLb = async () => {
      setLoadingGlobalLb(true);
      try {
        const lb = await getGlobalLuvviXLeaderboard(10);
        setGlobalLeaderboard(lb);
      } catch (err) {
        setError("Failed to load global LuvviX leaderboard.");
        console.error("Error fetching global LuvviX leaderboard:", err);
      } finally {
        setLoadingGlobalLb(false);
      }
    };
    fetchGlobalLb();
  }, []);

  const renderLeaderboardList = (leaderboardData, isGlobal = false) => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return <p className="text-gray-500 text-sm">No scores or data available for this leaderboard yet.</p>;
    }
    return (
      <ul className="space-y-2">
        {leaderboardData.map((entry, index) => (
          <li key={entry.id || entry.userId || entry.scoreId || index} className={`p-3 rounded-md flex justify-between items-center text-sm ${
              index === 0 ? 'bg-yellow-100 border-yellow-400 border-l-4 shadow-sm' 
              : index === 1 ? 'bg-gray-100 border-gray-400 border-l-4 shadow-sm' 
              : index === 2 ? 'bg-orange-100 border-orange-400 border-l-4 shadow-sm' 
              : 'bg-gray-50'
          }`}>
            <div className="flex items-center">
              <span className="font-semibold text-gray-600 w-6 mr-2 text-center">{index + 1}.</span>
              {isGlobal && entry.photoURL && (
                <img src={entry.photoURL} alt={entry.displayName} className="w-8 h-8 rounded-full mr-2 object-cover"/>
              )}
              <span className="font-medium text-gray-800">{entry.displayName || entry.userId?.substring(0,10) || 'Player'}</span>
            </div>
            <span className="font-bold text-indigo-600">
              {isGlobal ? (entry.luvviXScore || 0).toLocaleString() : entry.score.toLocaleString()}
              {isGlobal && <span className="text-xs text-gray-500 ml-1">LP</span>}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🏆 Leaderboards 🏆</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Game Specific Leaderboard */}
        <section className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Game Leaderboard</h2>
          {loadingGames ? (
            <p>Loading game list...</p>
          ) : (
            <div className="mb-4">
              <label htmlFor="gameSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Game:</label>
              <select
                id="gameSelect"
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={games.length === 0}
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.title}</option>
                ))}
                 {games.length === 0 && <option value="">No games available</option>}
              </select>
            </div>
          )}
          {loadingGameLb ? <p>Loading leaderboard...</p> : renderLeaderboardList(gameLeaderboard)}
        </section>

        {/* Global LuvviX Leaderboard */}
        <section className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Global LuvviX Ranking</h2>
          {loadingGlobalLb ? <p>Loading global leaderboard...</p> : renderLeaderboardList(globalLeaderboard, true)}
        </section>
      </div>
    </div>
  );
};

export default LeaderboardsPage;
