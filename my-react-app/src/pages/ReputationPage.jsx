import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { getReputationInsights } from '../services/engagementService'; // Adjust path
import { Timestamp } from 'firebase/firestore'; // For formatting date

// Helper to format Firestore Timestamp for display
const formatReputationDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleDateString([], { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

const ReputationPage = () => {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = useCallback(async () => {
    if (!currentUser?.uid) {
      setError("Please log in to view your reputation insights.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getReputationInsights(currentUser.uid);
      setInsights(data);
    } catch (err) {
      console.error("Error fetching reputation insights:", err);
      setError("Failed to load reputation insights. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getInsightStyle = (value) => {
    const lowerValue = String(value).toLowerCase();
    if (lowerValue.includes("positive") || lowerValue.includes("haute") || lowerValue.includes("très haute")) return "text-green-600 font-semibold";
    if (lowerValue.includes("neutre") || lowerValue.includes("moyenne")) return "text-yellow-600 font-semibold";
    if (lowerValue.includes("negative") || lowerValue.includes("basse")) return "text-red-600 font-semibold";
    return "text-gray-700";
  };


  if (loading) return <p className="text-center text-gray-500 py-10">Loading Reputation Insights...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!currentUser) return <p className="text-center text-gray-500 py-10">Please log in.</p>;
  if (!insights) return <p className="text-center text-gray-500 py-10">Could not load reputation insights.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">📊 Your Reputation Insights (Simulated)</h1>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Overall Reputation:</h3>
            <p className={getInsightStyle(insights.overallReputation)}>{insights.overallReputation}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Contribution Level:</h3>
            <p className={getInsightStyle(insights.contributionLevel)}>{insights.contributionLevel}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Social Behavior:</h3>
            <p className={getInsightStyle(insights.socialBehavior)}>{insights.socialBehavior}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Trust Index (0-100):</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${insights.trustIndex || 0}%` }}
                title={`${insights.trustIndex || 0}%`}
              ></div>
            </div>
             <p className="text-blue-700 font-semibold text-center">{insights.trustIndex || 0}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm md:col-span-2">
            <h3 className="font-semibold text-gray-500 mb-1">Recent Post Sentiment (Simulated):</h3>
            <p className={getInsightStyle(insights.recentPostSentiment)}>{insights.recentPostSentiment}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm md:col-span-2">
            <h3 className="font-semibold text-gray-500 mb-1">Recent Comment Sentiment (Simulated):</h3>
            <p className={getInsightStyle(insights.recentCommentSentiment)}>{insights.recentCommentSentiment}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center">
          Last Assessed: {formatReputationDate(insights.lastAssessed)}
        </p>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Note: These insights are simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
};

export default ReputationPage;
