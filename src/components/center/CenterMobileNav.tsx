
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageCircle, 
  User, 
  Users, 
  Gamepad2, 
  Menu
} from 'lucide-react';

interface CenterMobileNavProps {
  activeView: string;
  setActiveView: (view: any) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const CenterMobileNav = ({ 
  activeView, 
  setActiveView, 
  isMenuOpen, 
  setIsMenuOpen 
}: CenterMobileNavProps) => {
  const navItems = [
    { id: 'feed', icon: Home },
    { id: 'messages', icon: MessageCircle, badge: 3 },
    { id: 'groups', icon: Users },
    { id: 'games', icon: Gamepad2 },
    { id: 'profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`relative flex flex-col items-center p-2 ${
                isActive 
                  ? 'text-purple-600' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="h-6 w-6" />
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CenterMobileNav;
