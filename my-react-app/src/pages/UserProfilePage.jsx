import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Assuming React Router for userId param
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { getUserProfile, timestampToDateString } from '../services/profileService'; // Adjust path
import EditProfileForm from '../components/features/profile/EditProfileForm'; // Adjust path
import ProfileCard from '../components/features/profile/ProfileCard'; // Adjust path

// Placeholder for a verification badge icon (e.g., from an icon library)
const VerificationBadge = ({ isVisible }) => 
  isVisible ? (
    <span 
      className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      title="Verified Account"
    >
      Verified
    </span>
  ) : null;


function UserProfilePage({ profileIdFromProp }) { // profileIdFromProp for non-router usage
  const { currentUser } = useAuth();
  const { userId: userIdFromParams } = useParams(); // Get userId from URL if using React Router
  const navigate = useNavigate(); // For navigation

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  const targetUserId = profileIdFromProp || userIdFromParams || currentUser?.uid;

  useEffect(() => {
    if (targetUserId) {
      setLoading(true);
      setError('');
      getUserProfile(targetUserId)
        .then(userProfile => {
          if (userProfile) {
            setProfile(userProfile);
          } else {
            setError('Profile not found.');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching user profile page data:", err);
          setError('Failed to load profile.');
          setLoading(false);
        });
    } else if (!currentUser && !profileIdFromProp && !userIdFromParams) {
      // No user context available (e.g. not logged in, no ID passed)
      setLoading(false);
      setError("No user specified and not logged in.");
      // Optionally, redirect to login or a generic error page
      // navigate('/login'); 
    }
  }, [targetUserId, currentUser]); // Re-fetch if targetUserId changes or currentUser logs in/out

  const canViewField = (fieldName) => {
    if (!profile) return false;
    if (currentUser?.uid === profile.userId) return true; // Owner can see everything

    const privacySetting = profile.profilePrivacySettings?.[fieldName];
    // Add more granular checks like 'friends_only' if that system exists
    return privacySetting === 'public';
  };

  const handleToggleEditForm = () => {
    if (currentUser?.uid === profile?.userId) {
      setShowEditForm(prev => !prev);
    }
  }

  if (loading) return <p className="text-center text-xl text-gray-600 py-10">Loading profile...</p>;
  if (error) return <p className="text-center text-xl text-red-600 py-10">{error}</p>;
  if (!profile) return <p className="text-center text-xl text-gray-500 py-10">User profile could not be loaded.</p>;

  const {
    displayName,
    photoURL,
    bio,
    birthDate, // This is a Firestore Timestamp
    country,
    isVerified,
    luvviXScore,
    onlineStatus,
    userRole,
    email, // From profile document
    profilePrivacySettings = {}
  } = profile;

  const displayBirthDate = birthDate ? timestampToDateString(birthDate) : 'Not specified';

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:shrink-0 md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center">
            <ProfileCard profile={profile} />
             {currentUser?.uid === profile.userId && (
              <button
                onClick={handleToggleEditForm}
                className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showEditForm ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            )}
          </div>
          
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">
                {displayName}
                <VerificationBadge isVisible={isVerified} />
              </h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                onlineStatus === 'online' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
              }`}>
                {onlineStatus || 'offline'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Role: {userRole}</p>
            
            {canViewField('email') && (
                <p className="text-sm text-gray-600 mt-1">Email: {email || 'Not specified'}</p>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800">About Me</h2>
              {canViewField('bio') ? (
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{bio || 'No biography provided.'}</p>
              ) : (
                <p className="mt-2 text-gray-500 italic">Bio is private.</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-semibold text-gray-700">Country</h3>
                {canViewField('country') ? (
                  <p className="text-gray-600">{country || 'Not specified'}</p>
                ) : (
                  <p className="text-gray-500 italic">Country is private.</p>
                )}
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700">Birth Date</h3>
                {canViewField('birthDate') ? (
                  <p className="text-gray-600">{displayBirthDate}</p>
                ) : (
                  <p className="text-gray-500 italic">Birth date is private.</p>
                )}
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700">LuvviX Score</h3>
                 {canViewField('luvviXScore') ? (
                    <p className="text-gray-600">{luvviXScore !== undefined ? luvviXScore : 'Not scored'}</p>
                ) : (
                    <p className="text-gray-500 italic">LuvviX Score is private.</p>
                )}
              </div>
            </div>
            {/* AI Preferences and Public Data could be displayed here similarly, respecting privacy */}
          </div>
        </div>
        
        {showEditForm && currentUser?.uid === profile.userId && (
          <div className="p-6 border-t border-gray-200">
            <EditProfileForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
