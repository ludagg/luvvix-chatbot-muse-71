import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // If using React Router for navigation
import { listAvailableGames } from '../services/gameService'; // Adjust path
import GameCard from '../components/features/games/GameCard'; // Adjust path

const GamesHubPage = ({ onNavigateToGame }) => { // onNavigateToGame for non-router navigation
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For router-based navigation (alternative to onNavigateToGame prop)
  // const navigate = useNavigate(); 

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError('');
      try {
        const availableGames = await listAvailableGames();
        setGames(availableGames);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load games. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handlePlayGame = (gameId, gameTitle) => {
    console.log(`Navigating to game: ${gameTitle} (ID: ${gameId})`);
    if (onNavigateToGame) {
      onNavigateToGame('game_detail', gameId); // Use the App.jsx navigation function
    } else {
      // If using React Router directly:
      // navigate(`/games/${gameId}`); 
      alert(`Placeholder: Would navigate to game ${gameTitle}`);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading games...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }
  if (games.length === 0) {
    return <p className="text-center text-gray-500 py-10">No games available at the moment.</p>;
  }

  // Simulated sections (can be enhanced by filtering games based on properties like date added, popularity score etc.)
  const newGames = games.slice(0, 2); // Example: first 2 games are "new"
  const popularGames = games.slice(1, 4); // Example: games 2, 3, 4 are "popular"

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">LuvviX Games Hub</h1>

      {/* Simulated "Featured Game" Section - could be a larger card or specific game */}
      {games.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4 border-b-2 border-indigo-200 pb-2">Featured Game</h2>
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-2xl text-white">
            <h3 className="text-3xl font-bold mb-2">{games[0].title}</h3>
            <p className="text-md mb-4 opacity-90">{games[0].description}</p>
            <button 
              onClick={() => handlePlayGame(games[0].id, games[0].title)}
              className="bg-white text-indigo-700 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors text-lg"
            >
              Play Now!
            </button>
          </div>
        </section>
      )}
      
      {/* New Games Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">New Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newGames.map(game => (
            <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
          ))}
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Popular Games</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularGames.map(game => (
            <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
          ))}
        </div>
      </section>

      {/* All Games Section */}
      <section>
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">All Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map(game => (
            <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
          ))}
        </div>
      </section>
    </div>
  );
};

GamesHubPage.propTypes = {
    onNavigateToGame: PropTypes.func.isRequired, // Callback to App.jsx to change view and set gameId
};

export default GamesHubPage;
