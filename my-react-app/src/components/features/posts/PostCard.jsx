import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { addOrUpdateReaction, voteInPoll, getPost } from '../../../services/postService'; // Adjust path
import ProfileCard from '../profile/ProfileCard'; // Adjust path
import { getUserProfile } from '../../../services/profileService'; // Adjust path

// Helper to format dates (simplified)
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'Just now';
  const date = timestamp.toDate();
  // More sophisticated date formatting can be added (e.g., time ago)
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
};

// Placeholder for media display (can be expanded)
const MediaDisplay = ({ mediaItem }) => {
  if (!mediaItem || !mediaItem.url) return null;

  switch (mediaItem.type) {
    case 'image':
      return (
        <img 
          src={mediaItem.url} 
          alt="Post media" 
          className="mt-2 rounded-lg max-h-96 w-auto object-contain mx-auto" 
        />
      );
    case 'video':
      return (
        <video controls src={mediaItem.url} className="mt-2 rounded-lg max-w-full mx-auto">
          Your browser does not support the video tag.
        </video>
      );
    case 'audio':
      return (
        <audio controls src={mediaItem.url} className="mt-2 w-full">
          Your browser does not support the audio element.
        </audio>
      );
    default:
      return (
        <a href={mediaItem.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 mt-2 block">
          View Media File
        </a>
      );
  }
};

function PostCard({ post: initialPost }) {
  const { currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [error, setError] = useState('');
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isInteracting, setIsInteracting] = useState(false); // For disabling buttons during async ops

  useEffect(() => {
    setPost(initialPost); // Update post if prop changes
  }, [initialPost]);
  
  useEffect(() => {
    if (post?.userId) {
      getUserProfile(post.userId)
        .then(setAuthorProfile)
        .catch(err => console.error("Error fetching author profile for post card:", err));
    }
  }, [post?.userId]);

  const refreshPostData = async () => {
    if (!post?.id) return;
    try {
      const updatedPostData = await getPost(post.id);
      if (updatedPostData) {
        setPost(updatedPostData);
      }
    } catch (err) {
      console.error("Error refreshing post data:", err);
      setError("Could not update post information.");
    }
  };

  const handleReaction = async (reactionType) => {
    if (!currentUser || !post?.id) {
      setError("You must be logged in to react.");
      return;
    }
    setIsInteracting(true);
    setError('');
    try {
      await addOrUpdateReaction(post.id, currentUser.uid, reactionType);
      // Optimistic update or refresh post data
      // For simplicity, we'll refresh the whole post data to get updated reactions
      await refreshPostData();
    } catch (err) {
      console.error(`Error ${reactionType}ing post:`, err);
      setError(err.message || `Failed to ${reactionType} post.`);
    } finally {
      setIsInteracting(false);
    }
  };

  const handlePollVote = async (optionIndex) => {
    if (!currentUser || !post?.id) {
      setError("You must be logged in to vote.");
      return;
    }
    if (post.poll?.voters?.includes(currentUser.uid)) {
      setError("You have already voted in this poll.");
      return;
    }
    setIsInteracting(true);
    setError('');
    try {
      await voteInPoll(post.id, currentUser.uid, optionIndex);
      // Refresh post data to show new poll results
      await refreshPostData();
    } catch (err) {
      console.error("Error voting in poll:", err);
      setError(err.message || "Failed to vote.");
    } finally {
      setIsInteracting(false);
    }
  };

  const toggleTranslate = () => {
    if (translatedText) {
      setTranslatedText('');
    } else {
      // Simulate translation by prefixing
      setTranslatedText(`(Translated) ${post.textContent}`);
    }
  };

  if (!post) return null; // Or a loading skeleton

  const {
    textContent,
    media,
    tags,
    poll,
    reactions,
    aiSummary,
    createdAt,
    updatedAt,
    userId, // author's ID
  } = post;

  const totalVotes = poll ? poll.options.reduce((sum, option) => sum + (option.votes || 0), 0) : 0;
  const userHasVoted = poll && currentUser && poll.voters?.includes(currentUser.uid);

  return (
    <div className={`p-4 bg-white shadow-md rounded-lg my-4 ${focusMode ? 'fixed inset-0 z-50 overflow-auto p-8' : 'max-w-xl mx-auto'}`}>
      {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
      
      <div className="flex items-center mb-3">
        {authorProfile ? (
          <ProfileCard profile={authorProfile} /> // Using the existing ProfileCard for author display
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div> // Placeholder
        )}
        <div className="ml-3">
            <p className="font-semibold text-gray-800">{post.authorDisplayName || 'Loading author...'}</p>
            <p className="text-xs text-gray-500">
                Posted: {formatDate(createdAt)}
                {updatedAt && createdAt?.seconds !== updatedAt?.seconds && ` (Edited: ${formatDate(updatedAt)})`}
            </p>
        </div>
      </div>

      {/* Content */}
      <div className={focusMode ? 'text-lg' : ''}>
        <p className="text-gray-700 whitespace-pre-wrap my-2">{translatedText || textContent}</p>
      </div>

      {/* Media */}
      {media && media.length > 0 && (
        <div className="my-3 grid grid-cols-1 gap-2">
          {media.map((item, index) => (
            <MediaDisplay key={index} mediaItem={item} />
          ))}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="my-2">
          {tags.map((tag, index) => (
            <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2 mb-1">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Poll */}
      {poll && (
        <div className="my-4 p-3 border border-gray-200 rounded-md">
          <h4 className="font-semibold text-gray-800 mb-2">{poll.question}</h4>
          <div className="space-y-2">
            {poll.options.map((option, index) => (
              <div key={index}>
                <button
                  onClick={() => handlePollVote(index)}
                  disabled={userHasVoted || isInteracting}
                  className={`w-full text-left p-2 border rounded-md ${
                    userHasVoted && poll.voters[currentUser.uid] === index ? 'bg-indigo-100 border-indigo-300' : 'border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option.text}</span>
                    {userHasVoted && (
                      <span className="text-xs font-medium">
                        {((option.votes || 0) / (totalVotes || 1) * 100).toFixed(0)}% ({option.votes || 0})
                      </span>
                    )}
                  </div>
                  {userHasVoted && ( // Progress bar
                     <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                       <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${((option.votes || 0) / (totalVotes || 1) * 100).toFixed(0)}%` }}></div>
                     </div>
                  )}
                </button>
              </div>
            ))}
          </div>
          {userHasVoted && <p className="text-xs text-gray-500 mt-2">You have voted. Total votes: {totalVotes}</p>}
          {!userHasVoted && <p className="text-xs text-gray-500 mt-2">Total votes: {totalVotes}. Click an option to vote.</p>}
        </div>
      )}

      {/* Reactions & Actions (conditionally render if not in focus mode) */}
      {!focusMode && (
        <>
          <div className="my-3 flex items-center space-x-4">
            {['like', 'love', 'wow', 'sad', 'angry'].map(reactionType => (
              <button
                key={reactionType}
                onClick={() => handleReaction(reactionType)}
                disabled={isInteracting}
                className={`flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50 capitalize 
                            ${reactions?.[reactionType]?.includes(currentUser?.uid) ? 'text-indigo-600 font-semibold' : ''}`}
              >
                <span>{reactionType}</span>
                <span className="text-xs">({reactions?.[reactionType]?.length || 0})</span>
              </button>
            ))}
          </div>

          <div className="my-3 pt-2 border-t border-gray-200 space-x-2">
            <button onClick={() => setShowAiSummary(!showAiSummary)} className="text-xs text-indigo-500 hover:text-indigo-700">
              {showAiSummary ? 'Hide' : 'Show'} AI Summary
            </button>
            <button onClick={toggleTranslate} className="text-xs text-indigo-500 hover:text-indigo-700">
              {translatedText ? 'Original Text' : 'Translate (Simulated)'}
            </button>
            <button onClick={() => setFocusMode(!focusMode)} className="text-xs text-indigo-500 hover:text-indigo-700">
              {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </div>
        </>
      )}
      {focusMode && (
         <button onClick={() => setFocusMode(false)} className="mt-8 text-sm text-indigo-600 hover:text-indigo-800 block mx-auto">
            Exit Focus Mode
        </button>
      )}


      {showAiSummary && !focusMode && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <p className="text-sm font-semibold text-gray-700">AI Summary:</p>
          <p className="text-xs text-gray-600 italic">{aiSummary || 'No summary available.'}</p>
        </div>
      )}
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    authorDisplayName: PropTypes.string,
    authorPhotoURL: PropTypes.string,
    textContent: PropTypes.string,
    media: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })),
    tags: PropTypes.arrayOf(PropTypes.string),
    poll: PropTypes.shape({
      question: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        votes: PropTypes.number,
      })).isRequired,
      voters: PropTypes.arrayOf(PropTypes.string),
    }),
    reactions: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    aiSummary: PropTypes.string,
    createdAt: PropTypes.object, // Firestore Timestamp
    updatedAt: PropTypes.object, // Firestore Timestamp
  }).isRequired,
};

export default PostCard;
