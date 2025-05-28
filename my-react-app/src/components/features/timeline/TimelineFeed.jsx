import { useState, useEffect } from 'react';
import { getPostsForTimeline } from '../../../services/postService'; // Adjust path
import PostCard from '../posts/PostCard'; // Adjust path
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path

function TimelineFeed({ postsCount = 10 }) {
  const { currentUser } = useAuth(); // To know if a user is logged in, for context
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedPosts = await getPostsForTimeline(postsCount);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching timeline posts:", err);
      setError("Failed to load timeline. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, [postsCount, currentUser]); // Refetch if count changes or user logs in/out (in case feed depends on user state for some reason)

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl mx-auto my-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white shadow-md rounded-lg animate-pulse">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="ml-3 space-y-1">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-20 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 my-6">{error}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center text-gray-500 my-6">No posts to display yet. Be the first to create one!</p>;
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto my-6">
      {/* A button to manually refresh, could be useful */}
      <button 
        onClick={fetchPosts} 
        disabled={loading}
        className="mb-4 ml-auto block py-1 px-3 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 text-sm disabled:opacity-50"
      >
        {loading ? 'Refreshing...' : 'Refresh Feed'}
      </button>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default TimelineFeed;
