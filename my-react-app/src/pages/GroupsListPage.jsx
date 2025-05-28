import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { listPublicGroups, listUserGroups, joinPublicGroup, requestToJoinGroup } from '../services/groupService'; // Adjust path
import { getGroupSuggestions } from '../services/suggestionService'; // Adjust path
import GroupCard from '../components/features/groups/GroupCard'; // Adjust path
import CreateGroupForm from '../components/features/groups/CreateGroupForm'; // Adjust path

const GroupsListPage = ({ onViewGroup }) => { // onViewGroup to navigate to a specific group page
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'my_groups', 'suggestions'
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser?.uid && activeTab === 'my_groups') { // My Groups requires user
        setError("Please log in to see your groups.");
        setMyGroups([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    setError('');
    try {
      let data;
      switch (activeTab) {
        case 'discover':
          data = await listPublicGroups(20); // Fetch more for discovery
          setPublicGroups(data);
          break;
        case 'my_groups':
          if (currentUser?.uid) {
            data = await listUserGroups(currentUser.uid, 20);
            setMyGroups(data);
          } else {
             setMyGroups([]); // Clear if user logs out while on this tab
          }
          break;
        case 'suggestions':
            data = await getGroupSuggestions(currentUser?.uid, 5); // Assuming suggestions need userId
            setSuggestedGroups(data);
            break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab} groups:`, err);
      setError(`Failed to load ${activeTab} groups.`);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinGroup = async (groupId, groupType, requiresApprovalFlag) => {
    if (!currentUser?.uid) {
      setError("You must be logged in to join a group.");
      return;
    }
    try {
      if (groupType === 'public') {
        if (requiresApprovalFlag) {
          await requestToJoinGroup(groupId, currentUser.uid);
          alert("Request to join sent!");
        } else {
          await joinPublicGroup(groupId, currentUser.uid);
          alert("Successfully joined group!");
        }
        fetchData(); // Refresh lists
      } else {
        // Private groups might need an invite system, not direct join from list.
        alert("This is a private group. You may need an invitation to join.");
      }
    } catch (err) {
      setError(err.message || "Failed to join/request group.");
      alert(err.message || "Failed to join/request group.");
    }
  };
  
  const handleGroupCreated = (newGroupId, newGroupData) => {
      setShowCreateGroupForm(false);
      fetchData(); // Refresh group lists
      // Optionally, navigate to the new group page
      if (onViewGroup) {
          onViewGroup(newGroupId);
      }
  };


  const renderGroupList = (groups, type) => {
    if (loading) return <p className="text-gray-500">Loading groups...</p>;
    if (error && groups.length === 0) return <p className="text-red-500">{error}</p>;
    if (groups.length === 0) return <p className="text-gray-500">No groups found in this list.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {groups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            onJoin={type === 'discover' || type === 'suggestions' ? handleJoinGroup : undefined}
            onViewGroup={onViewGroup} // Pass navigation handler
            isMember={myGroups.some(myGroup => myGroup.id === group.id)} // Check if user is member
            canJoin={group.type === 'public'} // Simplified: can attempt to join public groups
            requiresApproval={group.requiresApproval}
          />
        ))}
      </div>
    );
  };
  
  const TabButton = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-medium text-sm rounded-t-lg focus:outline-none
            ${activeTab === tabName 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
        {currentUser && (
            <button
                onClick={() => setShowCreateGroupForm(true)}
                className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
            >
                Create Group
            </button>
        )}
      </div>

      {showCreateGroupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-0 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                 <CreateGroupForm 
                    onGroupCreated={handleGroupCreated} 
                    onClose={() => setShowCreateGroupForm(false)}
                />
            </div>
        </div>
      )}
      
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
            <TabButton tabName="discover" label="Discover Public Groups" />
            {currentUser && <TabButton tabName="my_groups" label="My Groups" />}
            <TabButton tabName="suggestions" label="Suggested Groups" />
        </nav>
      </div>

      {error && !loading && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div>
        {activeTab === 'discover' && renderGroupList(publicGroups, 'discover')}
        {activeTab === 'my_groups' && currentUser && renderGroupList(myGroups, 'my_groups')}
        {activeTab === 'suggestions' && renderGroupList(suggestedGroups, 'suggestions')}
      </div>
    </div>
  );
};

GroupsListPage.propTypes = {
    onViewGroup: PropTypes.func.isRequired, // Function to handle navigation to a single group page
};

export default GroupsListPage;
