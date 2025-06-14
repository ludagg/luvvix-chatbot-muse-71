
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageCircle, 
  User, 
  Gamepad2, 
  Users, 
  Settings,
  Menu,
  X
} from 'lucide-react';

type ActiveView = 'feed' | 'messages' | 'profile' | 'games' | 'groups' | 'settings' | 'notifications' | 'search' | 'trending';

interface CenterMobileNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
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
    {
      id: 'feed' as ActiveView,
      label: 'Accueil',
      icon: Home,
      badge: null
    },
    {
      id: 'messages' as ActiveView,
      label: 'Messages',
      icon: MessageCircle,
      badge: 3
    },
    {
      id: 'profile' as ActiveView,
      label: 'Profil',
      icon: User,
      badge: null
    },
    {
      id: 'games' as ActiveView,
      label: 'Jeux',
      icon: Gamepad2,
      badge: null
    },
    {
      id: 'groups' as ActiveView,
      label: 'Groupes',
      icon: Users,
      badge: 1
    },
    {
      id: 'settings' as ActiveView,
      label: 'Paramètres',
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-20 right-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white shadow-lg"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 pt-20">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            LuvviX Center
          </h2>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive ? 'bg-purple-600 text-white' : ''
                  }`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 relative ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CenterMobileNav;
