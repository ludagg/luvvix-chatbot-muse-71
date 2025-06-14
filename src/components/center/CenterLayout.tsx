
import React, { useState } from 'react';
import CenterSidebar from './CenterSidebar';
import CenterFeed from './CenterFeed';
import CenterRightPanel from './CenterRightPanel';
import CenterMobileNav from './CenterMobileNav';
import CenterMessaging from './CenterMessaging';
import CenterProfile from './CenterProfile';
import CenterGames from './CenterGames';
import CenterGroups from './CenterGroups';
import CenterSettings from './CenterSettings';

type ActiveView = 'feed' | 'messages' | 'profile' | 'games' | 'groups' | 'settings' | 'notifications' | 'search' | 'trending';

const CenterLayout = () => {
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeView) {
      case 'messages':
        return <CenterMessaging />;
      case 'profile':
        return <CenterProfile />;
      case 'games':
        return <CenterGames />;
      case 'groups':
        return <CenterGroups />;
      case 'settings':
        return <CenterSettings />;
      case 'notifications':
      case 'search':
      case 'trending':
        return <div className="p-8 text-center text-gray-500">Section en développement</div>;
      default:
        return <CenterFeed />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <CenterSidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </main>
        
        {/* Right Panel (visible only on feed) */}
        {activeView === 'feed' && (
          <div className="hidden xl:block w-80">
            <CenterRightPanel />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <CenterMobileNav 
          activeView={activeView} 
          setActiveView={setActiveView}
          isMenuOpen={isMobileMenuOpen}
          setIsMenuOpen={setIsMobileMenuOpen}
        />
      </div>
    </div>
  );
};

export default CenterLayout;
