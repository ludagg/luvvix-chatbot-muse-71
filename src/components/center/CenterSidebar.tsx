
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  MessageCircle, 
  User, 
  Gamepad2, 
  Users, 
  Settings,
  Bell,
  Search,
  TrendingUp
} from 'lucide-react';

interface CenterSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const CenterSidebar = ({ activeView, setActiveView }: CenterSidebarProps) => {
  const { user, profile } = useAuth();

  const mainNavItems = [
    {
      id: 'feed',
      label: 'Fil d\'actualité',
      icon: Home,
      badge: null
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: 3
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      badge: null
    },
    {
      id: 'games',
      label: 'Jeux',
      icon: Gamepad2,
      badge: null
    },
    {
      id: 'groups',
      label: 'Groupes',
      icon: Users,
      badge: 1
    }
  ];

  const secondaryNavItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 5
    },
    {
      id: 'search',
      label: 'Recherche',
      icon: Search,
      badge: null
    },
    {
      id: 'trending',
      label: 'Tendances',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 mb-8">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {profile?.full_name || 'Utilisateur'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profile?.username || user?.email?.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          {mainNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive ? 'bg-purple-600 text-white' : ''
                }`}
                onClick={() => setActiveView(item.id)}
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

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        {/* Secondary Navigation */}
        <nav className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Plus
          </h4>
          {secondaryNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive ? 'bg-purple-600 text-white' : ''
                }`}
                onClick={() => setActiveView(item.id)}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
            Vos statistiques
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Posts</span>
              <span className="font-medium">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Abonnés</span>
              <span className="font-medium">1.2k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Abonnements</span>
              <span className="font-medium">456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSidebar;
