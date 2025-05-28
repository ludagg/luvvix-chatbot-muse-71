import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { createPost } from '../../../services/postService'; // Adjust path
import { getUserProfile } from '../../../services/profileService'; // To get author details if needed

function CreatePostForm({ onPostCreated }) {
  const { currentUser } = useAuth();
  const [textContent, setTextContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // Array of File objects
  const [tags, setTags] = useState(''); // Comma-separated string
  const [visibility, setVisibility] = useState('public');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']); // Min 2 options
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) { // Max 4 options for simplicity
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) { // Min 2 options
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to create a post.");
      return;
    }
    if (!textContent.trim() && mediaFiles.length === 0 && !pollQuestion.trim()) {
      setError("Post cannot be empty. Add text, media, or a poll.");
      return;
    }
    setLoading(true);
    setError('');

    const postData = {
      textContent,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      visibility,
    };

    if (showPollCreator && pollQuestion.trim()) {
      const validPollOptions = pollOptions.filter(opt => opt.trim()).map(optText => ({ text: optText.trim(), votes: 0 }));
      if (validPollOptions.length >= 2) {
        postData.poll = {
          question: pollQuestion.trim(),
          options: validPollOptions,
          // 'voters' array will be initialized by postService
        };
      } else {
        setError("Poll must have a question and at least two valid options.");
        setLoading(false);
        return;
      }
    }
    // Links can be parsed from textContent server-side or added as a separate feature
    // For now, not explicitly adding 'links' field from form

    try {
      const newPostRef = await createPost(postData, mediaFiles);
      console.log("New post created:", newPostRef.id);
      // Clear form
      setTextContent('');
      setMediaFiles([]);
      setTags('');
      setVisibility('public');
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
      if (onPostCreated) onPostCreated(); // Callback for parent component (e.g., to refresh feed)
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <p className="text-center text-gray-600">Please log in to create a post.</p>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-xl mx-auto my-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Post</h2>
      {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            placeholder={`What's on your mind, ${currentUser.displayName || currentUser.email?.split('@')[0]}?`}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="4"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Media (Images/Videos)</label>
          <input
            type="file"
            multiple
            onChange={handleMediaChange}
            accept="image/*,video/*,audio/*" // Adjust as needed
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
           {mediaFiles.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {mediaFiles.length} file(s) selected: {mediaFiles.map(f => f.name).join(', ')}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., tech, travel, food"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only (Future Feature)</option>
            <option value="private">Private (Future Feature)</option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPollCreator(!showPollCreator)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showPollCreator ? 'Remove Poll' : 'Add Poll'}
          </button>
        </div>

        {showPollCreator && (
          <fieldset className="p-3 border border-gray-200 rounded-md space-y-3">
            <legend className="text-sm font-medium text-gray-700 px-1">Create Poll</legend>
            <div>
              <label htmlFor="pollQuestion" className="block text-xs font-medium text-gray-600">Question</label>
              <input
                type="text"
                id="pollQuestion"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What do you want to ask?"
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handlePollOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="block w-full px-2 py-1 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {pollOptions.length > 2 && (
                  <button type="button" onClick={() => removePollOption(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button type="button" onClick={addPollOption} className="text-xs text-indigo-500 hover:text-indigo-700">Add Option</button>
            )}
          </fieldset>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostForm;
