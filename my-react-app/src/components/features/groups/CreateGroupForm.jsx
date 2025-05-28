import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { createGroup } from '../../../services/groupService'; // Adjust path

function CreateGroupForm({ onGroupCreated, onClose }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [type, setType] = useState('public'); // 'public' or 'private'
  const [requiresApproval, setRequiresApproval] = useState(false); // For public groups
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to create a group.");
      return;
    }
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setLoading(true);
    setError('');

    const groupData = {
      name,
      description,
      photoURL,
      type,
      requiresApproval: type === 'public' ? requiresApproval : false,
    };

    try {
      const groupId = await createGroup(currentUser.uid, groupData);
      console.log("Group created with ID:", groupId);
      if (onGroupCreated) {
        onGroupCreated(groupId, groupData); // Pass back new group info
      }
      // Reset form or close modal
      setName('');
      setDescription('');
      setPhotoURL('');
      setType('public');
      setRequiresApproval(false);
      if (onClose) onClose(); // Close modal if it's a modal form
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto my-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Create New Group</h2>
      {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name*</label>
          <input
            type="text"
            id="groupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="groupDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="groupPhotoURL" className="block text-sm font-medium text-gray-700">Photo URL (Optional)</label>
          <input
            type="url"
            id="groupPhotoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="https://example.com/group-image.png"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="groupType" className="block text-sm font-medium text-gray-700">Group Type</label>
          <select
            id="groupType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        {type === 'public' && (
          <div className="flex items-center">
            <input
              id="requiresApproval"
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-900">
              Require admin approval for new members
            </label>
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-2">
          {onClose && (
             <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Creating Group...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}

CreateGroupForm.propTypes = {
  onGroupCreated: PropTypes.func,
  onClose: PropTypes.func, // If used in a modal
};

export default CreateGroupForm;
