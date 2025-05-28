import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Assuming React Router for groupId param
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import {
  getGroupDetails,
  joinPublicGroup,
  requestToJoinGroup,
  leaveGroup,
  approveJoinRequest,
  declineJoinRequest,
  // More admin actions like removeGroupMember, promoteToAdmin can be added
  // For now, focusing on join requests.
  getGroupPosts, // Simulated or basic
} from '../services/groupService'; // Adjust path
import { getUserProfile, listFriends } from '../services/profileService'; // To fetch member profiles & friends for invite
import ProfileCard from '../components/features/profile/ProfileCard'; // Adjust path
import ChatWindow from '../components/features/chat/ChatWindow'; // For embedded chat
import PostCard from '../components/features/posts/PostCard'; // For group posts (if any)
// import CreatePostForm from '../components/features/posts/CreatePostForm'; // For creating group posts

const GroupPage = ({ groupIdFromProp }) => { // groupIdFromProp for non-router usage
  const { currentUser } = useAuth();
  const { groupId: groupIdFromParams } = useParams();
  const navigate = useNavigate(); // For navigation if not using onViewGroup from parent

  const targetGroupId = groupIdFromProp || groupIdFromParams;

  const [group, setGroup] = useState(null);
  const [membersProfiles, setMembersProfiles] = useState([]);
  const [joinRequestsProfiles, setJoinRequestsProfiles] = useState([]);
  const [groupChatConversation, setGroupChatConversation] = useState(null); // To pass to ChatWindow
  const [groupPosts, setGroupPosts] = useState([]); // For group-specific posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'posts', 'members', 'requests' (admin)

  // Fetch group details
  const fetchGroupData = useCallback(async () => {
    if (!targetGroupId) {
      setError("No group ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const groupData = await getGroupDetails(targetGroupId);
      if (groupData) {
        setGroup(groupData);
        setIsAdmin(groupData.admins?.includes(currentUser?.uid));
        setIsMember(groupData.members?.includes(currentUser?.uid));

        // Fetch member profiles
        if (groupData.members && groupData.members.length > 0) {
          const profiles = await Promise.all(groupData.members.map(id => getUserProfile(id)));
          setMembersProfiles(profiles.filter(p => p));
        } else {
          setMembersProfiles([]);
        }
        
        // Fetch join request profiles if admin
        if (groupData.admins?.includes(currentUser?.uid) && groupData.joinRequests && groupData.joinRequests.length > 0) {
            const requestProfiles = await Promise.all(groupData.joinRequests.map(id => getUserProfile(id)));
            setJoinRequestsProfiles(requestProfiles.filter(p => p));
        } else {
            setJoinRequestsProfiles([]);
        }

        // Set up group chat conversation object for ChatWindow
        // ChatWindow expects a conversation object with at least { id, type, groupInfo }
        if (groupData.chatConversationId) {
          setGroupChatConversation({
            id: groupData.chatConversationId,
            type: 'group',
            groupInfo: { name: groupData.name, photoURL: groupData.photoURL },
            participants: groupData.members, // Pass current members as participants
          });
        }
        
        // Fetch group posts (simulated or basic)
        const posts = await getGroupPosts(targetGroupId, 10);
        setGroupPosts(posts);

      } else {
        setError('Group not found.');
        setGroup(null);
      }
    } catch (err) {
      console.error("Error fetching group details:", err);
      setError('Failed to load group details.');
    } finally {
      setLoading(false);
    }
  }, [targetGroupId, currentUser?.uid]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Action Handlers
  const handleJoin = async () => {
    if (!group || !currentUser) return;
    try {
      if (group.type === 'public') {
        if (group.requiresApproval) {
          await requestToJoinGroup(group.id, currentUser.uid);
          alert("Request to join sent!");
        } else {
          await joinPublicGroup(group.id, currentUser.uid);
          alert("Successfully joined group!");
        }
        fetchGroupData(); // Refresh
      }
    } catch (err) {
      setError(err.message || "Failed to join.");
      alert(err.message || "Failed to join.");
    }
  };

  const handleLeave = async () => {
    if (!group || !currentUser) return;
    // Add confirmation dialog here
    if (window.confirm("Are you sure you want to leave this group?")) {
        try {
            await leaveGroup(group.id, currentUser.uid);
            alert("You have left the group.");
            setIsMember(false); // Update local state immediately
            // If using router, navigate away or to groups list
            // navigate('/groups'); 
            fetchGroupData(); // Refresh group data (e.g., member count)
        } catch (err) {
            setError(err.message || "Failed to leave group.");
            alert(err.message || "Failed to leave group.");
        }
    }
  };
  
  const handleApproveRequest = async (requestingUserId) => {
    if (!group || !currentUser || !isAdmin) return;
    try {
        await approveJoinRequest(group.id, currentUser.uid, requestingUserId);
        alert("Join request approved.");
        fetchGroupData(); // Refresh
    } catch (err) {
        setError(err.message || "Failed to approve request.");
        alert(err.message || "Failed to approve request.");
    }
  };
  
  const handleDeclineRequest = async (requestingUserId) => {
    if (!group || !currentUser || !isAdmin) return;
     try {
        await declineJoinRequest(group.id, currentUser.uid, requestingUserId);
        alert("Join request declined.");
        fetchGroupData(); // Refresh
    } catch (err) {
        setError(err.message || "Failed to decline request.");
        alert(err.message || "Failed to decline request.");
    }
  };

  const TabButton = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-3 py-2 font-medium text-sm rounded-md focus:outline-none ${
        activeTab === tabId ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );


  if (loading && !group) return <p className="text-center text-xl text-gray-600 py-10">Loading group...</p>;
  if (error) return <p className="text-center text-xl text-red-600 py-10">{error}</p>;
  if (!group) return <p className="text-center text-xl text-gray-500 py-10">Group could not be loaded or found.</p>;

  return (
    <div className="container mx-auto p-2 md:p-4">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Group Header */}
        <div className="p-4 md:p-6 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4">
                <img 
                    src={group.photoURL || 'https://via.placeholder.com/150?text=Group'} 
                    alt={`${group.name}`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border bg-white mb-3 sm:mb-0"
                />
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{group.name}</h1>
                    <p className="text-sm text-gray-500 capitalize">{group.type} Group • {group.members?.length || 0} members</p>
                    <p className="text-gray-700 mt-2 text-sm">{group.description || "No description provided."}</p>
                </div>
                <div className="mt-3 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex sm:flex-col">
                    {!isMember && group.type === 'public' && (
                        <button onClick={handleJoin} className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                        {group.requiresApproval ? 'Request to Join' : 'Join Group'}
                        </button>
                    )}
                    {isMember && (
                        <button onClick={handleLeave} className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                        Leave Group
                        </button>
                    )}
                     <button onClick={() => alert("Simulated Watch Together!")} className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm">
                        Watch Together (Sim)
                    </button>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="px-2 md:px-4 py-2 border-b border-gray-200 flex space-x-1 md:space-x-2 overflow-x-auto">
          <TabButton tabId="chat" label="Group Chat" />
          <TabButton tabId="posts" label="Group Posts" />
          <TabButton tabId="members" label="Members" />
          {isAdmin && <TabButton tabId="requests" label={`Join Requests (${joinRequestsProfiles.length})`} />}
          {/* Add more tabs: Events, Settings (admin) etc. */}
        </div>

        {/* Tab Content */}
        <div className="p-2 md:p-4">
          {activeTab === 'chat' && (
            groupChatConversation ? (
              <div className="h-[60vh] md:h-[70vh] border rounded-md overflow-hidden"> {/* Constrain chat height */}
                <ChatWindow conversation={groupChatConversation} />
              </div>
            ) : (
              <p className="text-gray-500">Group chat is not available for this group.</p>
            )
          )}

          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Group Posts</h2>
              {/* <CreatePostForm groupId={group.id} onPostCreated={fetchGroupData} /> Placeholder for group post creation */}
              {groupPosts.length > 0 ? (
                groupPosts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <p className="text-gray-500">No posts in this group yet. (Group posts are simulated)</p>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Members ({membersProfiles.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {membersProfiles.map(profile => (
                  <div key={profile.id} className="bg-gray-50 p-2 rounded shadow">
                     <ProfileCard profile={profile} />
                     {/* Add admin actions here: remove member, promote/demote admin */}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'requests' && isAdmin && (
             <div>
              <h2 className="text-xl font-semibold mb-3">Join Requests ({joinRequestsProfiles.length})</h2>
              {joinRequestsProfiles.length > 0 ? (
                <div className="space-y-3">
                  {joinRequestsProfiles.map(profile => (
                    <div key={profile.id} className="bg-white p-3 rounded-lg shadow flex items-center justify-between">
                      <ProfileCard profile={profile} />
                      <div className="space-x-2">
                        <button onClick={() => handleApproveRequest(profile.id)} className="text-xs py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                        <button onClick={() => handleDeclineRequest(profile.id)} className="text-xs py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending join requests.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

GroupPage.propTypes = {
    groupIdFromProp: PropTypes.string, // For direct prop passing
};

export default GroupPage;
