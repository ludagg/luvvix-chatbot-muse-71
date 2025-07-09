import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MobileBottomNav from './MobileBottomNav';
import NotificationCenter from './NotificationCenter';
import MobileAssistant from './MobileAssistant';
import WeatherMobileWidget from './WeatherMobileWidget';
import MorningWeatherBriefing from './MorningWeatherBriefing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Plus, 
  Calendar, 
  Mail, 
  Settings,
  Brain,
  Zap,
  Shield,
  Users
} from 'lucide-react';

interface QuickActionCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  action: () => void;
}

interface AppCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  badge?: string;
}

const quickActions: QuickActionCard[] = [
  {
    id: 'new-email',
    name: 'Nouveau mail',
    icon: <Mail className="w-5 h-5" />,
    bgColor: 'bg-blue-100 text-blue-600',
    action: () => console.log('New email action')
  },
  {
    id: 'add-event',
    name: 'Ajouter event',
    icon: <Calendar className="w-5 h-5" />,
    bgColor: 'bg-green-100 text-green-600',
    action: () => console.log('Add event action')
  },
  {
    id: 'search-web',
    name: 'Recherche',
    icon: <Search className="w-5 h-5" />,
    bgColor: 'bg-gray-100 text-gray-600',
    action: () => console.log('Search web action')
  },
  {
    id: 'settings',
    name: 'Paramètres',
    icon: <Settings className="w-5 h-5" />,
    bgColor: 'bg-yellow-100 text-yellow-600',
    action: () => console.log('Settings action')
  }
];

const featuredApps: AppCard[] = [
  {
    id: 'ai-assistant',
    name: 'Assistant IA',
    description: 'Votre assistant personnel avancé',
    icon: <Brain className="w-6 h-6" />,
    bgColor: 'bg-purple-100 text-purple-600',
    badge: 'IA'
  },
  {
    id: 'automation',
    name: 'Orchestrateur',
    description: 'Automatisation intelligente',
    icon: <Zap className="w-6 h-6" />,
    bgColor: 'bg-orange-100 text-orange-600',
    badge: 'Révolutionnaire'
  },
  {
    id: 'security',
    name: 'Sécurité',
    description: 'Protection avancée',
    icon: <Shield className="w-6 h-6" />,
    bgColor: 'bg-red-100 text-red-600'
  },
  {
    id: 'center',
    name: 'LuvviX Center',
    description: 'Réseau social intelligent',
    icon: <Users className="w-6 h-6" />,
    bgColor: 'bg-pink-100 text-pink-600',
    badge: 'Social'
  }
];

const MobileHome = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LuvviX OS</h1>
            <p className="text-sm text-gray-600">
              Bonjour {user?.user_metadata?.full_name || 'Utilisateur'} 👋
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssistant(true)}
            >
              <Brain className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-20">
        {/* Briefing météo matinal */}
        <MorningWeatherBriefing />

        {/* Widget météo principal */}
        <div className="px-4 mb-6">
          <WeatherMobileWidget />
        </div>

        {/* Actions rapides */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 text-center">
                  <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center mx-auto mb-2`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-900">{action.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Applications recommandées */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Voir tout
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {featuredApps.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${app.bgColor} flex items-center justify-center`}>
                      {app.icon}
                    </div>
                    {app.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {app.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />

      {/* Modals */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <MobileAssistant 
        isOpen={showAssistant} 
        onClose={() => setShowAssistant(false)} 
      />
    </div>
  );
};

export default MobileHome;
