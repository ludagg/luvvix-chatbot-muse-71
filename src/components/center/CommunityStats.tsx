
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  Globe,
  Calendar,
  Target,
  Award
} from 'lucide-react';

interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  growthRate: number;
  topCountries: string[];
  dailyActiveUsers: number;
}

const CommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 15847,
    activeUsers: 3456,
    totalPosts: 8934,
    totalLikes: 45672,
    totalComments: 12890,
    growthRate: 23.5,
    topCountries: ['France', 'Canada', 'Belgique', 'Suisse'],
    dailyActiveUsers: 1234
  });

  const achievements = [
    {
      title: 'Communauté Grandissante',
      description: '+23.5% de nouveaux membres ce mois',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      color: 'text-green-600'
    },
    {
      title: 'Engagement Élevé',
      description: '78% d\'utilisateurs actifs quotidiens',
      icon: <Target className="h-5 w-5 text-blue-500" />,
      color: 'text-blue-600'
    },
    {
      title: 'Portée Internationale',
      description: 'Présent dans 45+ pays',
      icon: <Globe className="h-5 w-5 text-purple-500" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          Statistiques de la Communauté
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
            <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.totalLikes.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">J'aime</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.growthRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Croissance</div>
          </div>
        </div>

        {/* Active Users */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Utilisateurs Actifs</h4>
            <Badge variant="outline" className="text-xs">
              Aujourd'hui
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-purple-600">
              {stats.dailyActiveUsers.toLocaleString()}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${(stats.dailyActiveUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((stats.dailyActiveUsers / stats.totalUsers) * 100)}%
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-semibold text-sm mb-3">Pays les plus actifs</h4>
          <div className="flex flex-wrap gap-2">
            {stats.topCountries.map((country, index) => (
              <Badge key={country} variant="secondary" className="text-xs">
                {country}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Réalisations Récentes</h4>
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {achievement.icon}
              <div>
                <h5 className={`font-medium text-sm ${achievement.color}`}>
                  {achievement.title}
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <h4 className="font-semibold mb-1">Rejoignez la Communauté !</h4>
          <p className="text-sm opacity-90">
            Connectez-vous avec des milliers d'utilisateurs LuvviX
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityStats;
