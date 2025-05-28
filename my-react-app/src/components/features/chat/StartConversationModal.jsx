import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { getOrCreatePrivateConversation, createGroupConversation } from '../../../services/messageService'; // Adjust path
import { getUserProfile } from '../../../services/profileService'; // For user search simulation

// Simulated user list for search (replace with actual user search in a real app)
const SIMULATED_USERS = [
  { userId: 'user2_placeholder_id', displayName: 'Alice Wonderland', email: 'alice@example.com' },
  { userId: 'user3_placeholder_id', displayName: 'Bob The Builder', email: 'bob@example.com' },
  { userId: 'user4_placeholder_id', displayName: 'Charlie Brown', email: 'charlie@example.com' },
];


function StartConversationModal({ isOpen, onClose, onConversationStarted }) {
  const { currentUser } = useAuth();
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('private'); // 'private' or 'group'

  // For Private Chat
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // For Group Chat
  const [groupName, setGroupName] = useState('');
  const [groupPhotoUrl, setGroupPhotoUrl] = useState(''); // Optional
  const [groupParticipants, setGroupParticipants] = useState([]); // Array of userIds
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [participantSearchResults, setParticipantSearchResults] = useState([]);


  // Simulate user search
  useEffect(() => {
    if (activeTab === 'private' && searchTerm) {
      // Filter out current user from simulated search
      const filtered = SIMULATED_USERS.filter(
        user => user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) && user.userId !== currentUser?.uid
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, activeTab, currentUser?.uid]);

  useEffect(() => {
    if (activeTab === 'group' && participantSearchTerm) {
       const filtered = SIMULATED_USERS.filter(
        user => user.displayName.toLowerCase().includes(participantSearchTerm.toLowerCase()) && 
                !groupParticipants.includes(user.userId) && // Not already added
                user.userId !== currentUser?.uid // Not the current user (admin is added by default)
      );
      setParticipantSearchResults(filtered);
    } else {
      setParticipantSearchResults([]);
    }
  }, [participantSearchTerm, activeTab, groupParticipants, currentUser?.uid]);


  const handleStartPrivateChat = async () => {
    if (!selectedUser || !currentUser) {
      setModalError("Please select a user to chat with.");
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const conversationId = await getOrCreatePrivateConversation(currentUser.uid, selectedUser.userId);
      onConversationStarted(conversationId, 'private', selectedUser); // Pass back info for immediate use
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error starting private chat:", err);
      setModalError(err.message || "Failed to start private chat.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim() || !currentUser) {
      setModalError("Group name is required.");
      return;
    }
    if (groupParticipants.length === 0) {
        setModalError("Please add at least one participant to the group (besides yourself).");
        return;
    }

    setModalLoading(true);
    setModalError('');
    // Ensure admin (current user) is part of the participants list for the service function
    const allParticipants = [...new Set([currentUser.uid, ...groupParticipants])];

    try {
      const conversationId = await createGroupConversation(
        currentUser.uid,
        allParticipants,
        { name: groupName, photoURL: groupPhotoUrl }
      );
      onConversationStarted(conversationId, 'group', { name: groupName, photoURL: groupPhotoUrl }); // Pass back info
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error creating group chat:", err);
      setModalError(err.message || "Failed to create group chat.");
    } finally {
      setModalLoading(false);
    }
  };
  
  const toggleParticipant = (user) => {
    if (groupParticipants.includes(user.userId)) {
      setGroupParticipants(prev => prev.filter(id => id !== user.userId));
    } else {
      setGroupParticipants(prev => [...prev, user.userId]);
    }
    setParticipantSearchTerm(''); // Clear search after selection
    setParticipantSearchResults([]);
  };


  const resetForm = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    setGroupName('');
    setGroupPhotoUrl('');
    setGroupParticipants([]);
    setParticipantSearchTerm('');
    setParticipantSearchResults([]);
    setModalError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Start New Conversation</h2>
          <button onClick={() => { resetForm(); onClose(); }} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('private')}
              className={`${
                activeTab === 'private'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Private Chat
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`${
                activeTab === 'group'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Create Group
            </button>
          </nav>
        </div>

        {modalError && <p className="text-red-500 text-sm text-center mb-3">{modalError}</p>}

        {/* Private Chat Tab Content */}
        {activeTab === 'private' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search users by name (simulated)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchResults.length > 0 && (
              <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {searchResults.map(user => (
                  <li
                    key={user.userId}
                    onClick={() => { setSelectedUser(user); setSearchTerm(user.displayName); setSearchResults([]); }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {user.displayName} ({user.email})
                  </li>
                ))}
              </ul>
            )}
            {selectedUser && <p className="text-sm text-gray-600">Selected: {selectedUser.displayName}</p>}
            <button
              onClick={handleStartPrivateChat}
              disabled={modalLoading || !selectedUser}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {modalLoading ? 'Starting...' : 'Chat with User'}
            </button>
          </div>
        )}

        {/* Group Chat Tab Content */}
        {activeTab === 'group' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Group Photo URL (Optional)"
              value={groupPhotoUrl}
              onChange={(e) => setGroupPhotoUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
             <div>
                <input
                    type="text"
                    placeholder="Search participants to add (simulated)..."
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-1"
                />
                {participantSearchResults.length > 0 && (
                    <ul className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                        {participantSearchResults.map(user => (
                        <li
                            key={user.userId}
                            onClick={() => toggleParticipant(user)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {user.displayName} ({user.email})
                        </li>
                        ))}
                    </ul>
                )}
                <div className="mt-2 text-sm">
                    <p className="font-medium">Participants ({groupParticipants.length + 1}):</p>
                    <ul className="list-disc list-inside pl-1">
                        <li>{currentUser?.displayName || currentUser?.email} (Admin)</li>
                        {groupParticipants.map(id => {
                            const user = SIMULATED_USERS.find(u => u.userId === id) || {displayName: 'Unknown User'};
                            return <li key={id}>{user.displayName} <button onClick={() => toggleParticipant(user)} className="text-red-500 text-xs ml-1">(remove)</button></li>;
                        })}
                    </ul>
                </div>
            </div>
            <button
              onClick={handleCreateGroupChat}
              disabled={modalLoading || !groupName.trim()}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {modalLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

StartConversationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConversationStarted: PropTypes.func.isRequired, // Callback with (conversationId, type, metadata)
};

export default StartConversationModal;
