import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom'; // If using React Router for navigation

function GroupCard({ group, onJoin, onViewGroup, isMember, canJoin, requiresApproval }) {
  if (!group) return null;

  const { name, photoURL, description, members, type } = group;
  const memberCount = members?.length || 0;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <img 
        src={photoURL || 'https://via.placeholder.com/400x200?text=Group+Photo'} 
        alt={`${name} group`} 
        className="w-full h-32 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={name}>
          {/* If using React Router, Link would be good here */}
          {/* <Link to={`/groups/${group.id}`} className="hover:text-indigo-600">{name}</Link> */}
          {name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 capitalize">
          {type} Group • {memberCount} member(s)
        </p>
        <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis">
          {description || 'No description available.'}
        </p>
        
        <div className="flex space-x-2">
            {onViewGroup && (
                 <button
                    onClick={() => onViewGroup(group.id)}
                    className="flex-1 bg-indigo-500 text-white text-xs py-1 px-3 rounded-md hover:bg-indigo-600 transition-colors"
                >
                    View Group
                </button>
            )}
            {onJoin && !isMember && canJoin && (
                <button
                    onClick={() => onJoin(group.id, group.type, group.requiresApproval)}
                    className="flex-1 bg-green-500 text-white text-xs py-1 px-3 rounded-md hover:bg-green-600 transition-colors"
                >
                    {requiresApproval ? 'Request to Join' : 'Join Group'}
                </button>
            )}
             {isMember && (
                <span className="flex-1 text-center bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-md">
                    Member
                </span>
            )}
        </div>
      </div>
    </div>
  );
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    description: PropTypes.string,
    members: PropTypes.array, // Array of userIds
    type: PropTypes.string, // 'public' or 'private'
    requiresApproval: PropTypes.bool,
  }).isRequired,
  onJoin: PropTypes.func, // Optional: (groupId, groupType, requiresApproval) => void
  onViewGroup: PropTypes.func, // Optional: (groupId) => void
  isMember: PropTypes.bool, // Is current user a member?
  canJoin: PropTypes.bool, // Can current user join (e.g. not private and not member)
  requiresApproval: PropTypes.bool, // Does this group require approval to join?
};

export default GroupCard;
