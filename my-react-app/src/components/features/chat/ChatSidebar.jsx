import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { getUserConversations, archiveConversation, pinConversation } from '../../../services/messageService'; // Adjust path
import { getUserProfile } from '../../../services/profileService'; // For fetching partner/group details

// Helper to format last message time for sidebar
const formatLastMessageTime = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return '';
  const date = timestamp.toDate();
  const now = new Date();
  const diffInDays = (now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24);

  if (diffInDays < 1) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString();
};

function ChatSidebar({ onSelectConversation, currentConversationId, onStartNewConversation }) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantProfiles, setParticipantProfiles] = useState({}); // Store profiles { userId: profile }

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    const unsubscribe = getUserConversations(currentUser.uid, (loadedConversations) => {
      setConversations(loadedConversations);
      // Fetch profiles for participants of new conversations for display names/photos
      loadedConversations.forEach(convo => {
        if (convo.type === 'private') {
          const partnerId = convo.participants.find(pId => pId !== currentUser.uid);
          if (partnerId && !participantProfiles[partnerId]) {
            getUserProfile(partnerId)
              .then(profile => {
                if (profile) setParticipantProfiles(prev => ({ ...prev, [partnerId]: profile }));
              })
              .catch(err => console.warn(`Failed to fetch profile for ${partnerId}`, err));
          }
        }
        // For group chats, groupInfo.name and groupInfo.photoURL are used directly from convo object
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);


  const getConversationDisplayDetails = (convo) => {
    if (!currentUser) return { name: 'Chat', photo: 'https://via.placeholder.com/40' };

    if (convo.type === 'group') {
      return {
        name: convo.groupInfo?.name || 'Group Chat',
        photo: convo.groupInfo?.photoURL || 'https://via.placeholder.com/40',
      };
    } else { // Private
      const partnerId = convo.participants.find(pId => pId !== currentUser.uid);
      const profile = participantProfiles[partnerId];
      return {
        name: profile?.displayName || 'User',
        photo: profile?.photoURL || 'https://via.placeholder.com/40',
      };
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const details = getConversationDisplayDetails(convo);
    return details.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Separate pinned and archived, then sort the rest
  const pinnedConvos = filteredConversations.filter(c => c.pinnedBy?.includes(currentUser?.uid) && !c.archivedBy?.includes(currentUser?.uid));
  const archivedConvos = filteredConversations.filter(c => c.archivedBy?.includes(currentUser?.uid));
  const normalConvos = filteredConversations.filter(c => !c.pinnedBy?.includes(currentUser?.uid) && !c.archivedBy?.includes(currentUser?.uid));


  const handleTogglePin = async (e, convoId, isCurrentlyPinned) => {
    e.stopPropagation(); // Prevent conversation selection
    if (!currentUser?.uid) return;
    try {
      await pinConversation(convoId, currentUser.uid, !isCurrentlyPinned);
      // UI will update via listener
    } catch (err) {
      console.error("Error pinning conversation:", err);
      // Show error to user
    }
  };
  
  const handleToggleArchive = async (e, convoId, isCurrentlyArchived) => {
    e.stopPropagation(); // Prevent conversation selection
     if (!currentUser?.uid) return;
    try {
      await archiveConversation(convoId, currentUser.uid, !isCurrentlyArchived);
      // UI will update via listener
    } catch (err) {
      console.error("Error archiving conversation:", err);
    }
  };

  const ConversationItem = ({ convo }) => {
    const details = getConversationDisplayDetails(convo);
    const isUnread = convo.lastMessage && 
                     convo.lastMessage.senderId !== currentUser?.uid &&
                     !convo.lastMessage.readBy?.includes(currentUser?.uid); // Simplified unread logic

    const isPinned = convo.pinnedBy?.includes(currentUser?.uid);
    const isArchived = convo.archivedBy?.includes(currentUser?.uid);

    return (
      <li
        onClick={() => onSelectConversation(convo)}
        className={`p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center justify-between ${
          currentConversationId === convo.id ? 'bg-indigo-100' : ''
        }`}
      >
        <div className="flex items-center min-w-0"> {/* min-w-0 for text ellipsis */}
          <img src={details.photo} alt={details.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
          <div className="flex-grow min-w-0">
            <p className={`font-semibold truncate ${isUnread ? 'text-indigo-700' : 'text-gray-800'}`}>
              {details.name}
            </p>
            <p className={`text-xs truncate ${isUnread ? 'text-indigo-500 font-medium' : 'text-gray-500'}`}>
              {convo.lastMessage?.text || 'No messages yet'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-0.5 ml-1">
            <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatLastMessageTime(convo.lastMessage?.timestamp)}
            </span>
            <div className="flex space-x-1">
                 <button onClick={(e) => handleTogglePin(e, convo.id, isPinned)} title={isPinned ? "Unpin" : "Pin"} className={`text-xs p-0.5 rounded ${isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                    📌 {/* Pin icon */}
                </button>
                <button onClick={(e) => handleToggleArchive(e, convo.id, isArchived)} title={isArchived ? "Unarchive" : "Archive"} className={`text-xs p-0.5 rounded ${isArchived ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                    📦 {/* Archive icon */}
                </button>
            </div>
        </div>
      </li>
    );
  };


  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-gray-200 bg-white">
      {/* Header with Search and New Chat */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={onStartNewConversation}
          className="mt-2 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-3 text-center text-gray-500">Loading conversations...</p>}
        {error && <p className="p-3 text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            {pinnedConvos.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pinned</h3>
                <ul className="space-y-1">{pinnedConvos.map(convo => <ConversationItem key={convo.id} convo={convo} />)}</ul>
              </div>
            )}
            {normalConvos.length > 0 && (
               <div className="p-2">
                 {pinnedConvos.length > 0 && <hr className="my-2"/>} {/* Separator if pinned exists */}
                 <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Chats</h3>
                 <ul className="space-y-1">{normalConvos.map(convo => <ConversationItem key={convo.id} convo={convo} />)}</ul>
               </div>
            )}
             {archivedConvos.length > 0 && (
              <div className="p-2">
                <hr className="my-2"/>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Archived</h3>
                <ul className="space-y-1">{archivedConvos.map(convo => <ConversationItem key={convo.id} convo={convo} />)}</ul>
              </div>
            )}
            {filteredConversations.length === 0 && !loading && (
              <p className="p-3 text-center text-gray-500">No conversations found. Start a new one!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

ChatSidebar.propTypes = {
  onSelectConversation: PropTypes.func.isRequired,
  currentConversationId: PropTypes.string,
  onStartNewConversation: PropTypes.func.isRequired,
};

export default ChatSidebar;
