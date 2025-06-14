
import React from 'react';
import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Feather } from 'lucide-react';

interface TwitterSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCompose: () => void;
}

const TwitterSidebar = ({ activeTab, onTabChange, onCompose }: TwitterSidebarProps) => {
  const menuItems = [
    { id: 'feed', label: 'Accueil', icon: Home },
    { id: 'explore', label: 'Explorer', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'bookmarks', label: 'Signets', icon: Bookmark },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'more', label: 'Plus', icon: MoreHorizontal },
  ];

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center space-x-4 w-full p-3 rounded-full transition-colors hover:bg-gray-100 ${
              activeTab === item.id ? 'font-bold' : ''
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xl">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bouton Tweeter */}
      <button
        onClick={onCompose}
        className="w-full mt-8 bg-blue-500 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
      >
        <Feather className="w-5 h-5" />
        <span>Tweeter</span>
      </button>

      {/* Profile card */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">Utilisateur</p>
            <p className="text-gray-500 text-sm truncate">@user</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default TwitterSidebar;
