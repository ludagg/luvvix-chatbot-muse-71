import React from 'react';
import PropTypes from 'prop-types';

function GameCard({ game, onPlay }) {
  if (!game) return null;

  const { title, description, iconUrl, genre, type } = game;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <img 
        src={iconUrl || 'https://via.placeholder.com/300x200?text=Game+Icon'} 
        alt={`${title} icon`} 
        className="w-full h-40 object-cover" // Fixed height for icon area
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={title}>
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 capitalize">
          {genre} • {type}
        </p>
        <p className="text-sm text-gray-600 mb-3 flex-grow h-16 overflow-hidden text-ellipsis">
          {description || 'No description available.'}
        </p>
        
        <button
          onClick={() => onPlay(game.id, game.title)} // Pass gameId and title to onPlay
          className="mt-auto w-full bg-indigo-600 text-white text-sm py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Play Game
        </button>
      </div>
    </div>
  );
}

GameCard.propTypes = {
  game: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    iconUrl: PropTypes.string,
    genre: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onPlay: PropTypes.func.isRequired, // Callback function when "Play" is clicked
};

export default GameCard;
