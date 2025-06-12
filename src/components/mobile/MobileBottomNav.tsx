
import React from 'react';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const MobileBottomNav = ({ activeView, setActiveView }: MobileBottomNavProps) => {
  const navItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      )
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      ),
      isSpecial: true
    },
    {
      id: 'cloud',
      label: 'Cloud',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom">
      <div className="flex items-end justify-around">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-200 ${
                item.isSpecial ? '-mt-6' : ''
              }`}
            >
              <div className={`transition-colors ${
                isActive && !item.isSpecial 
                  ? 'text-blue-600' 
                  : !item.isSpecial 
                    ? 'text-gray-500' 
                    : ''
              }`}>
                {item.icon}
              </div>
              
              {!item.isSpecial && (
                <span className={`text-xs font-medium mt-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Indicator dots */}
      <div className="flex justify-center mt-1 space-x-1">
        <div className={`w-1 h-1 rounded-full transition-colors ${
          activeView === 'home' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`w-1 h-1 rounded-full transition-colors ${
          activeView === 'services' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`w-1 h-1 rounded-full transition-colors ${
          activeView === 'assistant' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`w-1 h-1 rounded-full transition-colors ${
          activeView === 'cloud' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`w-1 h-1 rounded-full transition-colors ${
          activeView === 'profile' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
