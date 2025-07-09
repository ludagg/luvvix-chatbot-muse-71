import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Bell, Calendar, FileText, Cloud, Bot, Zap, Users, TrendingUp, Star, Newspaper } from 'lucide-react';

interface MobileHomeProps {
  setActiveSection?: (section: string) => void;
}

const MobileHome = ({ setActiveSection }: MobileHomeProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    { 
      name: 'Assistant IA', 
      icon: Bot, 
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-assistant')),
      color: 'bg-purple-500'
    },
    { 
      name: 'Calendrier', 
      icon: Calendar, 
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-calendar')),
      color: 'bg-blue-500'
    },
    { 
      name: 'Formulaires', 
      icon: FileText, 
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-forms')),
      color: 'bg-orange-500'
    },
    { 
      name: 'Cloud', 
      icon: Cloud, 
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-cloud')),
      color: 'bg-green-500'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Header avec l'heure */}
      <div className="text-center space-y-2">
        <div className="text-4xl font-bold text-gray-900">
          {formatTime(currentTime)}
        </div>
        <div className="text-sm text-gray-600 capitalize">
          {formatDate(currentTime)}
        </div>
        <div className="text-lg font-medium text-gray-800">
          Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'} 👋
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">12</div>
            <div className="text-sm text-blue-600">Tâches complétées</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">85%</div>
            <div className="text-sm text-green-600">Productivité</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.name}
                onClick={action.action}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:shadow-lg transition-all"
              >
                <div className={`p-2 rounded-lg ${action.color}/20`}>
                  <IconComponent className={`w-6 h-6 text-gray-700`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Section Actualités */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Actualités</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection?.('news')}
            className="text-blue-600 hover:text-blue-800"
          >
            Voir tout
          </Button>
        </div>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  Résumé IA des actualités
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Découvrez les dernières actualités résumées par l'IA
                </p>
                <Badge variant="secondary" className="text-xs">
                  Mis à jour il y a 5 min
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications récentes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Notifications récentes</h3>
        <div className="space-y-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle tâche assignée</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Réunion dans 30 minutes</p>
                  <p className="text-xs text-gray-500">Il y a 1 heure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
