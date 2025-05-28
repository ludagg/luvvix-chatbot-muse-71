import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import {
  listFriends,
  listFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendFriendRequest // For suggestions
} from '../services/profileService'; // Adjust path
import { getFriendSuggestions } from '../services/suggestionService'; // Adjust path
import ProfileCard from '../components/features/profile/ProfileCard'; // Adjust path

const FriendsPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'received', 'sent', 'suggestions'
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError('');
    try {
      let data;
      switch (activeTab) {
        case 'friends':
          data = await listFriends(currentUser.uid);
          setFriends(data);
          break;
        case 'received':
          data = await listFriendRequests(currentUser.uid, 'received');
          setReceivedRequests(data);
          break;
        case 'sent':
          data = await listFriendRequests(currentUser.uid, 'sent');
          setSentRequests(data);
          break;
        case 'suggestions':
          data = await getFriendSuggestions(currentUser.uid, 5);
          setSuggestions(data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      setError(`Failed to load ${activeTab}.`);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptRequest = async (requesterId) => {
    if (!currentUser?.uid) return;
    try {
      await acceptFriendRequest(currentUser.uid, requesterId);
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to accept request.");
    }
  };

  const handleDeclineRequest = async (otherUserId, type) => {
    if (!currentUser?.uid) return;
    try {
      await declineFriendRequest(currentUser.uid, otherUserId, type);
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to decline request.");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!currentUser?.uid) return;
    try {
      await removeFriend(currentUser.uid, friendId);
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to remove friend.");
    }
  };
  
  const handleSendFriendRequestFromSuggestion = async (recipientId) => {
    if (!currentUser?.uid) return;
    try {
        await sendFriendRequest(currentUser.uid, recipientId);
        alert("Friend request sent!"); // Simple feedback
        fetchData(); // Refresh suggestions or move user from suggestions
    } catch (err) {
        setError(err.message || "Failed to send friend request.");
        alert(err.message || "Failed to send friend request.");
    }
  };

  const renderList = (items, type) => {
    if (loading) return <p className="text-gray-500">Loading...</p>;
    if (error && items.length === 0) return <p className="text-red-500">{error}</p>;
    if (items.length === 0) return <p className="text-gray-500">No users found in this list.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(user => (
          <div key={user.id || user.userId} className="bg-white p-3 rounded-lg shadow">
            <ProfileCard profile={user} /> {/* ProfileCard expects 'profile' prop */}
            <div className="mt-2 space-y-1 text-xs">
              {type === 'friends' && (
                <button onClick={() => handleRemoveFriend(user.id)} className="w-full py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Friend</button>
              )}
              {type === 'received' && (
                <div className="flex space-x-1">
                  <button onClick={() => handleAcceptRequest(user.id)} className="flex-1 py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600">Accept</button>
                  <button onClick={() => handleDeclineRequest(user.id, 'received')} className="flex-1 py-1 px-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Decline</button>
                </div>
              )}
              {type === 'sent' && (
                <button onClick={() => handleDeclineRequest(user.id, 'sent')} className="w-full py-1 px-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Cancel Request</button>
              )}
              {type === 'suggestions' && (
                <button onClick={() => handleSendFriendRequestFromSuggestion(user.id)} className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Friend</button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const TabButton = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-medium text-sm rounded-t-lg focus:outline-none
            ${activeTab === tabName 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'}`}
    >
        {label}
    </button>
  );


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Connections</h1>
      
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
            <TabButton tabName="friends" label="My Friends" />
            <TabButton tabName="received" label="Received Requests" />
            <TabButton tabName="sent" label="Sent Requests" />
            <TabButton tabName="suggestions" label="Suggestions" />
        </nav>
      </div>

      {error && !loading && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div>
        {activeTab === 'friends' && renderList(friends, 'friends')}
        {activeTab === 'received' && renderList(receivedRequests, 'received')}
        {activeTab === 'sent' && renderList(sentRequests, 'sent')}
        {activeTab === 'suggestions' && renderList(suggestions, 'suggestions')}
      </div>
    </div>
  );
};

export default FriendsPage;
