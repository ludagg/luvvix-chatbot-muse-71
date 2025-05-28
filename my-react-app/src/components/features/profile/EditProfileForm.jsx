import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { getUserProfile, updateUserProfile, timestampToDateString, dateToTimestamp } from '../../../services/profileService'; // Adjust path

function EditProfileForm() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    birthDate: '', // Store as YYYY-MM-DD string for input field
    country: '',
    profilePrivacySettings: {
      birthDate: 'private',
      country: 'public',
      // Add other fields as needed
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.uid) {
      setLoading(true);
      getUserProfile(currentUser.uid)
        .then(profile => {
          if (profile) {
            setProfileData({
              displayName: profile.displayName || '',
              bio: profile.bio || '',
              birthDate: profile.birthDate ? timestampToDateString(profile.birthDate) : '',
              country: profile.country || '',
              profilePrivacySettings: profile.profilePrivacySettings || { birthDate: 'private', country: 'public' },
              // photoURL is handled separately or if you want to display it here
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching profile for edit:", err);
          setError('Failed to load profile data.');
          setLoading(false);
        });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("privacy.")) {
      const field = name.split(".")[1];
      setProfileData(prev => ({
        ...prev,
        profilePrivacySettings: {
          ...prev.profilePrivacySettings,
          [field]: value,
        },
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
    setSuccess(''); // Clear success message on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      setError("You must be logged in to update your profile.");
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    const dataToUpdate = {
      ...profileData,
      birthDate: profileData.birthDate ? dateToTimestamp(profileData.birthDate) : null,
    };
    // photoURL could be handled by a separate upload component or if already available
    // For now, photoURL is not directly editable in this form to keep it simple.
    // It would be updated via updateUserProfile if included in dataToUpdate.

    try {
      await updateUserProfile(currentUser.uid, dataToUpdate);
      setSuccess('Profile updated successfully!');
      // Optionally re-fetch profile data or rely on local state being accurate
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.displayName) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (error && !profileData.displayName) return <p className="text-center text-red-500">{error}</p>;


  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Profile</h2>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            name="displayName"
            id="displayName"
            value={profileData.displayName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            id="bio"
            rows="3"
            value={profileData.bio}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            value={profileData.birthDate}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            id="country"
            value={profileData.country}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <fieldset className="mt-6">
          <legend className="text-base font-medium text-gray-900 mb-2">Privacy Settings</legend>
          <div className="space-y-2">
            <div>
              <label htmlFor="privacy.birthDate" className="block text-sm font-medium text-gray-700">Birth Date Visibility</label>
              <select
                name="privacy.birthDate"
                id="privacy.birthDate"
                value={profileData.profilePrivacySettings.birthDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="private">Private</option>
                <option value="friends_only">Friends Only</option> {/* Assuming 'friends' logic for future */}
                <option value="public">Public</option>
              </select>
            </div>
            <div>
              <label htmlFor="privacy.country" className="block text-sm font-medium text-gray-700">Country Visibility</label>
              <select
                name="privacy.country"
                id="privacy.country"
                value={profileData.profilePrivacySettings.country}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="private">Private</option>
                <option value="friends_only">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </div>
            {/* Add more privacy settings controls here */}
          </div>
        </fieldset>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileForm;
