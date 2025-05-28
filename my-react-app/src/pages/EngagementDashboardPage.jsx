import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { getUserProfile, completeMission, awardBadge, calculateLevel } from '../services/profileService'; // Adjust path
import { 
    listAvailableMissions, 
    listAvailableBadges,
    getMissionDetails, // Helper from engagementService
    getBadgeDefinition,  // Helper from engagementService
    checkAndAwardBadges // For passive badge checking
} from '../services/engagementService'; // Adjust path

const EngagementDashboardPage = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]); // Badges not yet earned
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    if (!currentUser?.uid) {
      setError("Please log in to view your engagement dashboard.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);

      const missions = await listAvailableMissions(currentUser.uid);
      setAvailableMissions(missions);

      const badges = await listAvailableBadges(currentUser.uid);
      setAvailableBadges(badges);
      
      // Simulate checking for new badges passively (e.g. based on level or other stats)
      // In a real app, this might be triggered by specific events.
      if (profile) {
        // This is a simulated check. The actual awardBadge would be called from profileService
        // based on criteria met by user actions, not just by loading the dashboard.
        // For demonstration, we can call the checkAndAwardBadges which internally has simulated logic.
        await checkAndAwardBadges(currentUser.uid); 
        // Re-fetch profile to see if any new badges were awarded by the simulated check
        const updatedProfile = await getUserProfile(currentUser.uid);
        setUserProfile(updatedProfile);
      }

    } catch (err) {
      console.error("Error loading engagement dashboard:", err);
      setError("Failed to load dashboard data. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCompleteMission = async (missionId) => {
    if (!currentUser?.uid) return;
    try {
      const missionDetails = await getMissionDetails(missionId); // Get details like rewardPoints
      if (!missionDetails) throw new Error("Mission details not found.");

      const result = await completeMission(currentUser.uid, missionDetails);
      if (result) {
        alert(`Mission "${missionDetails.title}" completed! You earned ${missionDetails.rewardPoints} LuvviX Points. New Score: ${result.newScore}, New Level: ${result.newLevel}`);
        if (result.newLevel > result.oldLevel) {
            alert(`🎉 Level Up! You are now Level ${result.newLevel}! 🎉`);
        }
      } else {
        alert(`Mission "${missionDetails.title}" was already completed or failed to complete.`);
      }
      loadDashboardData(); // Refresh dashboard
    } catch (err) {
      alert(`Error completing mission: ${err.message}`);
      console.error("Error completing mission:", err);
    }
  };
  
  // Simulate attempting to "earn" a badge by clicking.
  // In reality, badges are awarded based on criteria met through user actions.
  const handleAttemptEarnBadge = async (badgeId) => {
    if (!currentUser?.uid) return;
    try {
        const badgeDef = await getBadgeDefinition(badgeId);
        if (!badgeDef) throw new Error("Badge definition not found.");

        // This call simulates trying to award the badge.
        // The `awardBadge` function in profileService has its own (simulated) criteria check.
        // For demo, it might always award if not owned.
        const newlyAwarded = await awardBadge(currentUser.uid, badgeDef);
        if (newlyAwarded) {
            alert(`🎉 Badge Earned! 🎉\nYou got the "${badgeDef.name}" badge!`);
        } else {
            alert(`You either already have the "${badgeDef.name}" badge, or the criteria (simulated) were not met yet.`);
        }
        loadDashboardData(); // Refresh dashboard
    } catch (err) {
        alert(`Error with badge: ${err.message}`);
        console.error("Error attempting to earn badge:", err);
    }
  };


  if (loading) return <p className="text-center text-gray-500 py-10">Loading Dashboard...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!currentUser) return <p className="text-center text-gray-500 py-10">Please log in.</p>;
  if (!userProfile) return <p className="text-center text-gray-500 py-10">Could not load user profile.</p>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">🌟 Engagement Dashboard 🌟</h1>

      {/* User Stats Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Progress</h2>
        <img 
            src={userProfile.photoURL || 'https://via.placeholder.com/100'} 
            alt="Your avatar"
            className="w-24 h-24 rounded-full mx-auto my-3 border-4 border-indigo-300 shadow-md"
        />
        <p className="text-xl text-gray-700">
          <span className="font-bold text-indigo-600">{userProfile.displayName}</span>
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg">
            <p>LuvviX Score: <span className="font-bold text-purple-600">{userProfile.luvviXScore?.toLocaleString() || 0}</span> LP</p>
            <p>Level: <span className="font-bold text-green-600">{userProfile.level || calculateLevel(userProfile.luvviXScore || 0)}</span></p>
        </div>
      </section>

      {/* Earned Badges Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Badges ({userProfile.badges?.length || 0})</h2>
        {userProfile.badges && userProfile.badges.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center">
            {userProfile.badges.map(badge => (
              <div key={badge.badgeId} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg shadow-sm w-28 text-center" title={`${badge.name}: ${badge.description}`}>
                <img src={badge.iconUrl || 'https://via.placeholder.com/50?text=B'} alt={badge.name} className="w-12 h-12 mb-1"/>
                <p className="text-xs font-medium text-gray-700 truncate w-full">{badge.name}</p>
                <p className="text-xs text-gray-500">Earned: {badge.earnedAt ? new Date(badge.earnedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No badges earned yet. Complete missions and engage to earn them!</p>
        )}
      </section>
      
      {/* Available Missions Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Missions</h2>
        {availableMissions.length > 0 ? (
          <div className="space-y-4">
            {availableMissions.map(mission => (
              <div key={mission.missionId} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-indigo-600">{mission.title}</h3>
                <p className="text-sm text-gray-600 my-1">{mission.description}</p>
                <p className="text-xs text-green-500 font-medium">Reward: {mission.rewardPoints} LuvviX Points</p>
                <button
                  onClick={() => handleCompleteMission(mission.missionId)}
                  className="mt-2 text-xs py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Mark as Done (Simulated)
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No new missions available. You've completed them all for now!</p>
        )}
      </section>

      {/* Badges to Unlock Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Badges to Unlock</h2>
        {availableBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableBadges.map(badgeDef => (
              <div key={badgeDef.badgeId} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg shadow-sm text-center border border-dashed border-gray-300">
                <img src={badgeDef.iconUrl || 'https://via.placeholder.com/50?text=B'} alt={badgeDef.name} className="w-12 h-12 mb-1 opacity-60"/>
                <p className="text-xs font-medium text-gray-700 truncate w-full">{badgeDef.name}</p>
                <p className="text-xs text-gray-500 mb-1 h-8 overflow-hidden" title={badgeDef.description}>{badgeDef.description}</p>
                 {/*This button is for demo; in reality, badges are auto-awarded */}
                <button 
                    onClick={() => handleAttemptEarnBadge(badgeDef.badgeId)}
                    className="text-xs mt-1 py-0.5 px-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                    title="Simulate attempting to earn this badge (actual earning is based on criteria)"
                >
                    Attempt Earn (Sim)
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You've collected all available badges! More coming soon.</p>
        )}
      </section>
    </div>
  );
};

export default EngagementDashboardPage;
