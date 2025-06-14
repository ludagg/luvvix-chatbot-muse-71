
import React from 'react';
import { X, UserPlus } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface UserSuggestionsProps {
  users: UserProfile[];
  onFollow: (userId: string, isCurrentlyFollowing?: boolean) => void;
  onDismiss: (userId: string) => void;
  onUserClick?: (userId: string) => void;
}

const UserSuggestions = ({
  users,
  onFollow,
  onDismiss,
  onUserClick
}: UserSuggestionsProps) => {
  if (users.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Suggestions pour vous</h3>
        <button className="text-blue-500 text-sm font-medium">Voir tout</button>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {users.slice(0, 5).map((user) => (
          <div key={user.id} className="flex-shrink-0 w-32 relative">
            <button 
              onClick={() => onDismiss(user.id)}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
            <div 
              className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 cursor-pointer"
              onClick={() => {
                if (onUserClick) {
                  onUserClick(user.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Voir le profil de ${user.full_name}`}
            >
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {user.full_name || 'Utilisateur'}
              </h4>
              <p className="text-xs text-gray-500 mb-2 truncate">
                @{user.username || 'utilisateur'}
              </p>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(user.id, user.is_following);
                }}
                className={[
                  "w-full px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center space-x-1 transition-colors",
                  user.is_following 
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                ].join(" ")}
              >
                <UserPlus className="w-3 h-3" />
                <span>
                  {user.is_following ? "Suivi" : "Suivre"}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSuggestions;
