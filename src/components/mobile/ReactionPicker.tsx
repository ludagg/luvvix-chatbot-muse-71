
import React from 'react';

interface Reaction {
  emoji: string;
  name: string;
  color: string;
}

interface ReactionPickerProps {
  onReact: (reaction: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const ReactionPicker = ({ onReact, onClose, position }: ReactionPickerProps) => {
  const reactions: Reaction[] = [
    { emoji: '❤️', name: 'love', color: 'text-red-500' },
    { emoji: '👍', name: 'like', color: 'text-blue-500' },
    { emoji: '😂', name: 'laugh', color: 'text-yellow-500' },
    { emoji: '😮', name: 'wow', color: 'text-orange-500' },
    { emoji: '😢', name: 'sad', color: 'text-blue-400' },
    { emoji: '😡', name: 'angry', color: 'text-red-600' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Reaction picker */}
      <div 
        className="fixed z-50 bg-white rounded-full shadow-2xl p-2 flex items-center space-x-1"
        style={{
          left: Math.max(10, Math.min(position.x - 150, window.innerWidth - 310)),
          top: position.y - 60
        }}
      >
        {reactions.map((reaction) => (
          <button
            key={reaction.name}
            onClick={() => {
              onReact(reaction.name);
              onClose();
            }}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transform hover:scale-125 transition-all duration-200"
          >
            <span className="text-2xl">{reaction.emoji}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default ReactionPicker;
