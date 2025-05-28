import PropTypes from 'prop-types';

// Placeholder for a verification badge icon (e.g., from an icon library)
const VerificationBadge = () => (
  <span
    className="ml-1 inline-block h-4 w-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center"
    title="Verified Account"
  >
    ✓
  </span>
);

function ProfileCard({ profile }) {
  if (!profile) {
    return <div className="p-4 border rounded-lg shadow-md bg-white text-gray-500">Loading profile card...</div>;
  }

  const {
    displayName,
    photoURL,
    luvviXScore,
    isVerified,
    profilePrivacySettings = {} // Ensure privacy settings exist
  } = profile;

  // Determine if luvviXScore should be visible based on privacy
  // Assuming 'public' means visible to all.
  // This is a simplified check; real privacy logic might be more complex.
  const canShowLuvviXScore = profilePrivacySettings.luvviXScore === 'public' || profilePrivacySettings.luvviXScore === undefined; // undefined for backward compatibility or if not set

  return (
    <div className="max-w-xs p-4 border rounded-lg shadow-md bg-white">
      <div className="flex flex-col items-center">
        <img
          src={photoURL || 'https://via.placeholder.com/150'} // Default placeholder image
          alt={`${displayName}'s profile`}
          className="w-24 h-24 rounded-full object-cover mb-3 shadow-sm"
        />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            {displayName || 'User Name'}
            {isVerified && <VerificationBadge />}
          </h3>
          {canShowLuvviXScore && luvviXScore !== undefined && (
            <p className="text-sm text-gray-600 mt-1">
              LuvviX Score: <span className="font-medium">{luvviXScore}</span>
            </p>
          )}
          {/* You can add other summary information here if needed */}
        </div>
      </div>
    </div>
  );
}

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
    luvviXScore: PropTypes.number,
    isVerified: PropTypes.bool,
    profilePrivacySettings: PropTypes.object,
  }), // Can be null or undefined if loading or not found
};

export default ProfileCard;
