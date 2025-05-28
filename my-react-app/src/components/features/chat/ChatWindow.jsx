import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { sendMessage, listenToMessages, markMessagesAsRead, getAiConversationSummary } from '../../../services/messageService'; // Adjust path
import { getUserProfile } from '../../../services/profileService'; // Adjust path
import ChatMessage from './ChatMessage'; // Adjust path

function ChatWindow({ conversation, onBackToList }) { // onBackToList for mobile view
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationPartnerProfile, setConversationPartnerProfile] = useState(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const messagesEndRef = useRef(null); // To scroll to bottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch partner profile for private chats or group info
  useEffect(() => {
    if (conversation?.type === 'private' && currentUser) {
      const partnerId = conversation.participants.find(pId => pId !== currentUser.uid);
      if (partnerId) {
        getUserProfile(partnerId)
          .then(setConversationPartnerProfile)
          .catch(err => console.error("Error fetching partner profile:", err));
      }
    }
    // For group chats, conversation.groupInfo can be used directly for name/photo
  }, [conversation, currentUser]);

  // Listen to messages and mark as read
  useEffect(() => {
    if (!conversation?.id || !currentUser?.uid) return;

    setLoading(true);
    const unsubscribe = listenToMessages(conversation.id, (loadedMessages) => {
      setMessages(loadedMessages);
      markMessagesAsRead(conversation.id, currentUser.uid)
        .catch(err => console.error("Error marking messages as read:", err));
      setLoading(false);
      scrollToBottom(); // Scroll when new messages load
    });
    
    // Initial scroll to bottom after messages are loaded for the first time
    // Need a slight delay for DOM to update
    const timer = setTimeout(scrollToBottom, 100);


    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [conversation?.id, currentUser?.uid]);

  // Effect for scrolling when messages array changes (new message comes in)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessageText.trim() && !mediaFile) || !currentUser || !conversation?.id) return;

    setLoading(true); // Consider a different loading state for sending message
    setError('');
    try {
      await sendMessage(conversation.id, currentUser.uid, {
        textContent: newMessageText,
        mediaFile: mediaFile,
      });
      setNewMessageText('');
      setMediaFile(null);
      // messages will update via listener, which also calls scrollToBottom
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setLoading(false); // Reset sending message loading state
    }
  };

  const handleMediaFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      // Optionally, display a preview for images
    } else {
      setMediaFile(null);
    }
  };

  const handleFetchAiSummary = async () => {
    if (!conversation?.id) return;
    setIsFetchingSummary(true);
    setAiSummary('');
    try {
      const summary = await getAiConversationSummary(conversation.id);
      setAiSummary(summary);
    } catch (error) {
      console.error("Error fetching AI summary:", error);
      setAiSummary("Could not fetch summary.");
    } finally {
      setIsFetchingSummary(false);
    }
  };

  const getConversationName = () => {
    if (!conversation) return "Chat";
    if (conversation.type === 'group') {
      return conversation.groupInfo?.name || 'Group Chat';
    }
    // Private chat
    return conversationPartnerProfile?.displayName || 'User';
  };
  
  const getConversationPhoto = () => {
    if (!conversation) return 'https://via.placeholder.com/40'; // Default placeholder
    if (conversation.type === 'group') {
      return conversation.groupInfo?.photoURL || 'https://via.placeholder.com/40';
    }
    return conversationPartnerProfile?.photoURL || 'https://via.placeholder.com/40';
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500 text-lg">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          {onBackToList && (
            <button onClick={onBackToList} className="mr-2 p-1 rounded-full hover:bg-gray-200 md:hidden">
              {/* Back Arrow SVG or Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <img src={getConversationPhoto()} alt="Convo" className="w-10 h-10 rounded-full mr-3 object-cover"/>
          <div>
            <h2 className="text-md font-semibold text-gray-800">{getConversationName()}</h2>
            <p className="text-xs text-green-500">Online (Simulated)</p>
          </div>
        </div>
        <button 
            onClick={handleFetchAiSummary} 
            disabled={isFetchingSummary}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
            {isFetchingSummary ? 'Summarizing...' : 'AI Summary'}
        </button>
      </header>

      {aiSummary && (
        <div className="p-2 bg-blue-50 text-xs text-blue-700 border-b border-blue-200">
            <strong>AI Summary:</strong> {aiSummary}
             <button onClick={() => setAiSummary('')} className="ml-2 text-blue-400 hover:text-blue-600">[clear]</button>
        </div>
      )}

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {loading && messages.length === 0 && <p className="text-center text-gray-500">Loading messages...</p>}
        {!loading && messages.length === 0 && <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>}
        {messages.map(msg => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            // Pass senderProfile if available (optimization: fetch all participant profiles once)
            senderProfile={msg.senderId === conversationPartnerProfile?.userId ? conversationPartnerProfile : null} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-xs text-center py-1">{error}</p>}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-gray-50">
        {mediaFile && (
          <div className="mb-2 text-xs text-gray-600">
            Selected file: {mediaFile.name} 
            <button type="button" onClick={() => setMediaFile(null)} className="ml-2 text-red-500">[remove]</button>
          </div>
        )}
        <div className="flex items-center">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
          />
          {/* Basic Emoji Picker Placeholder - A real one would be a component */}
          <button type="button" className="p-2 border-t border-b border-gray-300 text-gray-600 hover:bg-gray-100">😊</button>
          <label htmlFor="mediaFile" className="p-2 border-t border-b border-r border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer">
            📎
            <input type="file" id="mediaFile" onChange={handleMediaFileChange} className="hidden" />
          </label>
          <button
            type="submit"
            disabled={loading || (!newMessageText.trim() && !mediaFile)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

ChatWindow.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.oneOf(['private', 'group']).isRequired,
    groupInfo: PropTypes.shape({
      name: PropTypes.string,
      photoURL: PropTypes.string,
    }),
    // ... other conversation fields
  }), // Can be null if no conversation is selected
  onBackToList: PropTypes.func, // For mobile navigation
};

export default ChatWindow;
