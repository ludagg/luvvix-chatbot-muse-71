
import React from 'react';
import { Home, Grid3X3, Sparkles, MessageCircle, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const MobileBottomNav = ({ activeView, setActiveView }: MobileBottomNavProps) => {
  const navItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home
    },
    {
      id: 'services',
      label: 'Services',
      icon: Grid3X3
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: Sparkles,
      isSpecial: true
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom shadow-lg">
      <div className="flex items-end justify-around">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-200 ${
                item.isSpecial ? '-mt-6' : ''
              }`}
            >
              {item.isSpecial ? (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
              ) : (
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}>
                  <IconComponent className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
              )}
              
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
        {navItems.map((item) => (
          <div
            key={`dot-${item.id}`}
            className={`w-1 h-1 rounded-full transition-colors ${
              activeView === item.id ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
