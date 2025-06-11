
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Grid3X3, 
  Brain, 
  User, 
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: 'Accueil', 
      icon: Home, 
      path: '/',
      badge: null 
    },
    { 
      id: 'ecosystem', 
      label: 'Apps', 
      icon: Grid3X3, 
      path: '/ecosystem',
      badge: null 
    },
    { 
      id: 'revolutionary', 
      label: 'IA', 
      icon: Brain, 
      path: '/revolutionary',
      badge: 'NEW',
      special: true 
    },
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: User, 
      path: '/dashboard',
      badge: null 
    },
    { 
      id: 'settings', 
      label: 'Plus', 
      icon: Settings, 
      path: '/settings',
      badge: null 
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-gray-100 shadow-lg z-50 safe-area-pb">
      <div className="grid grid-cols-5 h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.id} to={item.path} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={`relative flex flex-col items-center justify-center h-full w-full gap-1 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? item.special
                      ? 'text-white bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 shadow-lg shadow-purple-500/30' 
                      : 'text-blue-600 bg-blue-50/80'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                } ${item.special && !isActive ? 'transform hover:scale-105' : ''}`}
              >
                <div className="relative">
                  {item.special ? (
                    <div className={`relative ${isActive ? 'text-white' : 'text-purple-600'}`}>
                      <Icon className="h-7 w-7" />
                      {!isActive && (
                        <>
                          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
                          <Zap className="absolute -bottom-1 -left-1 h-3 w-3 text-blue-500 animate-bounce" />
                        </>
                      )}
                    </div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                  
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-8 p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                <span className={`text-xs font-medium ${
                  item.special 
                    ? isActive 
                      ? 'text-white font-bold' 
                      : 'text-purple-600 font-semibold'
                    : isActive 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                
                {isActive && !item.special && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full bg-blue-600" />
                )}
                
                {item.special && isActive && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full bg-white/80" />
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
