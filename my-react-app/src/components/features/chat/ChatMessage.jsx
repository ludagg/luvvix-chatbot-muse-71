import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { translateMessageText } from '../../../services/messageService'; // Simulated

// Helper to format message timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return '';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Placeholder for media display (can be expanded from PostCard's version or simplified)
const MessageMediaDisplay = ({ mediaUrl, mediaType }) => {
  if (!mediaUrl || !mediaType) return null;

  switch (mediaType) {
    case 'image':
      return (
        <img 
          src={mediaUrl} 
          alt="Message media" 
          className="mt-1 rounded-lg max-w-xs max-h-64 object-contain" 
        />
      );
    case 'video':
      return (
        <video controls src={mediaUrl} className="mt-1 rounded-lg max-w-xs">
          Your browser does not support the video tag.
        </video>
      );
    case 'audio':
      return (
        <audio controls src={mediaUrl} className="mt-1 w-full max-w-xs">
          Your browser does not support the audio element.
        </audio>
      );
    default: // 'file' or other types
      return (
        <a 
          href={mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-600 hover:text-indigo-800 mt-1 block underline"
        >
          View Attached File
        </a>
      );
  }
};

function ChatMessage({ message, senderProfile }) { // senderProfile can be passed for optimization
  const { currentUser } = useAuth();
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  if (!message) return null;

  const isCurrentUserSender = message.senderId === currentUser?.uid;
  const senderName = isCurrentUserSender ? 'You' : senderProfile?.displayName || message.senderId.substring(0,6); // Fallback to short ID

  const handleTranslate = async () => {
    if (!message.textContent) return;
    if (translatedText) { // Toggle off
      setTranslatedText('');
      return;
    }
    setIsTranslating(true);
    try {
      // Simulate asking for target language or use a default
      const targetLang = 'en'; // Example
      const result = await translateMessageText(message.textContent, targetLang);
      setTranslatedText(result);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Error translating.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextToSpeech = () => {
    const textToSpeak = translatedText || message.textContent;
    if (textToSpeak && 'speechSynthesis' in window) {
      console.log(`Simulating text-to-speech for: "${textToSpeak}"`);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // utterance.lang = targetLang || document.documentElement.lang || 'en-US'; // Set language if available
      speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not available or no text.");
    }
  };
  
  // Determine read status (simplified: "Seen by X, Y" or just "✓✓" if read by anyone other than sender)
  const readByOthers = message.readBy?.filter(uid => uid !== message.senderId) || [];
  const isReadBySomeoneElse = readByOthers.length > 0;


  return (
    <div className={`flex mb-3 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3/4 p-2 rounded-lg shadow ${
        isCurrentUserSender 
          ? 'bg-indigo-500 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
      }`}>
        {!isCurrentUserSender && (
          <p className="text-xs font-semibold mb-0.5">{senderName}</p>
        )}
        {message.textContent && (
          <p className="text-sm whitespace-pre-wrap">{translatedText || message.textContent}</p>
        )}
        {message.mediaUrl && (
          <MessageMediaDisplay mediaUrl={message.mediaUrl} mediaType={message.mediaType} />
        )}
        <div className={`text-xs mt-1 ${isCurrentUserSender ? 'text-indigo-200' : 'text-gray-500'} flex items-center justify-end space-x-2`}>
          <span>{formatMessageTime(message.timestamp)}</span>
          {isCurrentUserSender && (
            <span title={isReadBySomeoneElse ? `Seen by ${readByOthers.length} other(s)` : "Sent"}>
              {isReadBySomeoneElse ? '✓✓' : '✓'}
            </span>
          )}
        </div>
        {/* Action buttons */}
        <div className={`mt-1 flex space-x-2 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
          {message.textContent && (
            <button 
              onClick={handleTranslate} 
              disabled={isTranslating}
              className={`text-xs px-1 py-0.5 rounded ${isCurrentUserSender ? 'hover:bg-indigo-600' : 'hover:bg-gray-100'}`}
            >
              {isTranslating ? 'Translating...' : (translatedText ? 'Original' : 'Translate')}
            </button>
          )}
          {(message.textContent || translatedText) && (
            <button 
              onClick={handleTextToSpeech} 
              className={`text-xs px-1 py-0.5 rounded ${isCurrentUserSender ? 'hover:bg-indigo-600' : 'hover:bg-gray-100'}`}
            >
              Speak
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    senderId: PropTypes.string.isRequired,
    textContent: PropTypes.string,
    mediaUrl: PropTypes.string,
    mediaType: PropTypes.string,
    timestamp: PropTypes.object, // Firestore Timestamp
    readBy: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  senderProfile: PropTypes.shape({ // Optional: Pass sender's profile for display name/pic
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }),
};

export default ChatMessage;
