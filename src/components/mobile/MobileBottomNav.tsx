
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Grid3X3, 
  Brain, 
  User, 
  Settings,
  Sparkles
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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 safe-area-pb">
      <div className="grid grid-cols-5 h-16">
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
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } ${item.special ? 'transform scale-110' : ''}`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${item.special ? 'h-6 w-6' : ''}`} />
                  {item.special && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  )}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-8 p-0 flex items-center justify-center text-xs font-bold"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs font-medium ${item.special ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${
                    item.special ? 'bg-purple-600' : 'bg-blue-600'
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
