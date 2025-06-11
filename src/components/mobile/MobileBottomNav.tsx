
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Grid3X3, 
  Brain, 
  User, 
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: 'Accueil', 
      icon: Home, 
      path: '/'
    },
    { 
      id: 'ecosystem', 
      label: 'Apps', 
      icon: Grid3X3, 
      path: '/ecosystem'
    },
    { 
      id: 'revolutionary', 
      label: 'IA', 
      icon: Brain, 
      path: '/revolutionary',
      special: true 
    },
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: User, 
      path: '/dashboard'
    },
    { 
      id: 'settings', 
      label: 'Plus', 
      icon: Settings, 
      path: '/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg z-50 safe-area-pb">
      <div className="grid grid-cols-5 h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.id} to={item.path} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={`relative flex flex-col items-center justify-center h-full w-full gap-1 rounded-none transition-all duration-200 ${
                  isActive 
                    ? item.special
                      ? 'text-white bg-gradient-to-b from-indigo-500 to-purple-600' 
                      : 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon className={`${item.special ? 'h-6 w-6' : 'h-5 w-5'}`} />
                </div>
                
                <span className={`text-xs font-medium ${
                  item.special 
                    ? isActive 
                      ? 'text-white' 
                      : 'text-purple-600'
                    : isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                
                {/* Indicateur actif */}
                {isActive && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                    item.special ? 'bg-white' : 'bg-blue-600'
                  }`} />
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
