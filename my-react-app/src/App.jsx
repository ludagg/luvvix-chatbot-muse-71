import { useAuth } from './contexts/AuthContext'; // Adjusted path
import SignUpForm from './components/features/auth/SignUpForm'; // Adjusted path
import LoginForm from './components/features/auth/LoginForm'; // Adjusted path
// Commenting out Post-related imports as ChatPage will be the main view
// import CreatePostForm from './components/features/posts/CreatePostForm';
// import TimelineFeed from './components/features/timeline/TimelineFeed';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import GroupsListPage from './pages/GroupsListPage';
import GroupPage from './pages/GroupPage';
import EventsPage from './pages/EventsPage';
import GamesHubPage from './pages/GamesHubPage';
import GamePage from './pages/GamePage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import ChallengesPage from './pages/ChallengesPage';
import EngagementDashboardPage from './pages/EngagementDashboardPage'; // New Import
import ReputationPage from './pages/ReputationPage'; // New Import
import AiSocialAssistantWidget from './components/features/engagement/AiSocialAssistantWidget'; // New Import
import { logout } from './services/authService';
import { useCall } from './contexts/CallContext';
import IncomingCallModal from './components/features/calls/IncomingCallModal';
import CallWindow from './components/features/calls/CallWindow';
import './App.css'; // Keep or remove default styling as needed

// Simple NavLink component
const NavLink = ({ currentView, viewName, setView, children }) => (
  <button
    onClick={() => setView(viewName)}
    className={`px-3 py-2 rounded-md text-sm font-medium
      ${currentView === viewName 
        ? 'bg-indigo-700 text-white' 
        : 'text-gray-300 hover:bg-indigo-500 hover:text-white'}`}
  >
    {children}
  </button>
);


function App() {
  const { currentUser } = useAuth();
  const { isCallWindowVisible, incomingCall } = useCall();
  const [currentView, setCurrentView] = useState('chat'); // Added 'dashboard', 'reputation'
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [isAiWidgetVisible, setIsAiWidgetVisible] = useState(false); // State for AI Widget

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out successfully');
      // Potentially redirect to login page or clear state further if needed
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Removed refreshTimelineKey and handlePostCreated as they are post-specific

  const handleViewGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentView('group_detail');
  };

  const handleNavigateToGame = (viewType, gameId) => {
    // viewType could be 'game_detail' or other game related views
    setSelectedGameId(gameId);
    setCurrentView(viewType); // e.g. 'game_detail'
  };
  
  const handleNavigateBackToGamesHub = () => {
      setCurrentView('games_hub');
      setSelectedGameId(null);
  };


  const renderMainContent = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'chat':
        return <ChatPage />;
      case 'friends':
        return <FriendsPage />;
      case 'groups':
        return <GroupsListPage onViewGroup={handleViewGroup} />;
      case 'group_detail':
        if (selectedGroupId) {
          const navigateFromGroup = (view, id = null) => { // Renamed for clarity
            setCurrentView(view);
            setSelectedGroupId(id);
          };
          return <GroupPage groupIdFromProp={selectedGroupId} navigate={navigateFromGroup} />;
        }
        setCurrentView('groups'); 
        return <GroupsListPage onViewGroup={handleViewGroup} />;
      case 'events':
        return <EventsPage />;
      case 'games_hub':
        return <GamesHubPage onNavigateToGame={handleNavigateToGame} />;
      case 'game_detail':
        if (selectedGameId) {
            return <GamePage gameIdFromProp={selectedGameId} onNavigateBack={handleNavigateBackToGamesHub} />;
        }
        setCurrentView('games_hub'); // Fallback to games hub
        return <GamesHubPage onNavigateToGame={handleNavigateToGame} />;
      case 'leaderboards':
        return <LeaderboardsPage />;
      case 'challenges':
        return <ChallengesPage />;
      case 'dashboard':
        return <EngagementDashboardPage />;
      case 'reputation':
        return <ReputationPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <> 
      {!currentUser ? (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <div className="space-y-8">
              <SignUpForm />
              <LoginForm />
            </div>
          </div>
          <footer className="w-full text-center text-gray-500 text-sm mt-12">
            <p>This is a placeholder authentication setup using Firebase Email/Password.</p>
            <p>It is designed to be adaptable for LuvviX ID integration in the future.</p>
          </footer>
        </div>
      ) : (
        <div className="flex flex-col h-screen"> {/* Ensure full height for layout */}
          {/* Main Navigation Bar */}
          <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14">
                <div className="flex items-center space-x-2"> {/* Reduced space for more items */}
                  <span className="font-bold text-lg">LuvviX</span>
                  <NavLink currentView={currentView} viewName="chat" setView={setCurrentView}>Chat</NavLink>
                  <NavLink currentView={currentView} viewName="friends" setView={setCurrentView}>Friends</NavLink>
                  <NavLink currentView={currentView} viewName="groups" setView={setCurrentView}>Groups</NavLink>
                  <NavLink currentView={currentView} viewName="events" setView={setCurrentView}>Events</NavLink>
                  <NavLink currentView={currentView} viewName="games_hub" setView={setCurrentView}>Games</NavLink>
                  <NavLink currentView={currentView} viewName="leaderboards" setView={setCurrentView}>Leaders</NavLink>
                  <NavLink currentView={currentView} viewName="challenges" setView={setCurrentView}>Challenges</NavLink>
                  <NavLink currentView={currentView} viewName="dashboard" setView={setCurrentView}>Dashboard</NavLink>
                  <NavLink currentView={currentView} viewName="reputation" setView={setCurrentView}>Reputation</NavLink>
                </div>
                <div className="flex items-center space-x-2"> {/* Added space-x-2 */}
                    <button 
                        onClick={() => setIsAiWidgetVisible(prev => !prev)}
                        className="p-1.5 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-500 hover:text-white"
                        title="Toggle AI Social Assistant"
                    >
                        🤖 AI
                    </button>
                    <span className="text-sm text-gray-300 hidden sm:inline">{currentUser.displayName || currentUser.email}</span>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto bg-gray-100 relative"> {/* Added relative for potential absolute positioned elements within main */}
            {renderMainContent()}
          </main>
        </div>
      )}

      {/* Global Modals and Call Windows controlled by CallContext */}
      {currentUser && incomingCall && <IncomingCallModal />}
      {currentUser && isCallWindowVisible && <CallWindow />}
      {/* AI Social Assistant Widget - Renders if user is logged in and widget is visible */}
      {currentUser && <AiSocialAssistantWidget isVisible={isAiWidgetVisible} onClose={() => setIsAiWidgetVisible(false)} />}
    </>
  );
}

export default App;
        <p>
          This is a placeholder authentication setup using Firebase Email/Password.
        </p>
        <p>
          It is designed to be adaptable for LuvviX ID integration in the future.
        </p>
      </footer>
    </div>
  );
}

export default App;
