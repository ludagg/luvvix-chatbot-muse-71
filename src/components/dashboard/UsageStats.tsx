
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Activity, Share2 } from "lucide-react";

const UsageStats = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState({
    totalUsageTime: 0,
    lastLoginTime: new Date(),
    activeSessions: 1
  });

  useEffect(() => {
    // Dans un cas réel, ces données proviendraient d'une API
    // On simule ici des données pour la démonstration
    const fetchStats = async () => {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        totalUsageTime: Math.floor(Math.random() * 240) + 60, // 1-5 heures en minutes
        lastLoginTime: new Date(),
        activeSessions: Math.floor(Math.random() * 2) + 1 // 1-3 sessions
      });
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  // Formater la durée en format heures:minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          Statistiques d'utilisation
        </CardTitle>
        <CardDescription>
          Votre activité sur la plateforme LuvviX
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Temps d'utilisation</span>
            </div>
            <span className="font-medium">{formatDuration(stats.totalUsageTime)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Sessions actives</span>
            </div>
            <span className="font-medium">{stats.activeSessions}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Dernière connexion</span>
            </div>
            <span className="font-medium">
              {stats.lastLoginTime.toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStats;
