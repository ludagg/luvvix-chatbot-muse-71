
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageCircle, 
  User, 
  Users, 
  Gamepad2, 
  Settings,
  Bell,
  Hash,
  TrendingUp
} from 'lucide-react';

interface CenterSidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const CenterSidebar = ({ activeView, setActiveView }: CenterSidebarProps) => {
  const { user, profile } = useAuth();

  const menuItems = [
    { id: 'feed', label: 'Accueil', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: 3 },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'groups', label: 'Groupes', icon: Users },
    { id: 'games', label: 'Mini-jeux', icon: Gamepad2 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.full_name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{profile?.username || user?.email?.split('@')[0]}
            </p>
          </div>
          <Badge variant="luvvix" className="text-xs">
            Vérifié
          </Badge>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Trending Topics */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Tendances
        </h3>
        <div className="space-y-2">
          {['#LuvviXCenter', '#IA2024', '#CommunautéFR'].map((tag) => (
            <div key={tag} className="flex items-center text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
              <Hash className="h-3 w-3 mr-1" />
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" size="sm" className="w-full">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>
    </div>
  );
};

export default CenterSidebar;
