
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Award, TrendingUp, Calendar, Star } from 'lucide-react';

const MobileProfile = () => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userEmail = user?.email || '';

  const stats = [
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      label: "Services utilisés",
      value: "8/12",
      trend: "+2 ce mois"
    },
    {
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      label: "Membre depuis",
      value: "Jan 2024",
      trend: "6 mois"
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      label: "Score LuvviX",
      value: "4.8/5",
      trend: "Excellent"
    }
  ];

  const recentActivity = [
    {
      icon: "🤖",
      title: "Assistant IA utilisé",
      time: "Il y a 2h",
      description: "Génération de contenu"
    },
    {
      icon: "🌤️",
      title: "Météo consultée",
      time: "Il y a 4h",
      description: "Paris, France"
    },
    {
      icon: "📰",
      title: "Actualités lues",
      time: "Hier",
      description: "3 articles"
    }
  ];

  const achievements = [
    {
      icon: "🏆",
      title: "Explorateur",
      description: "Premier service utilisé",
      unlocked: true
    },
    {
      icon: "🚀",
      title: "Power User",
      description: "10 services utilisés",
      unlocked: false
    },
    {
      icon: "⭐",
      title: "Expert LuvviX",
      description: "Tous les services maîtrisés",
      unlocked: false
    }
  ];

  return (
    <div className="flex-1 overflow-auto pb-20">
      {/* Header profil */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userName}</h2>
            <p className="text-blue-100">{userEmail}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-blue-100 text-sm">En ligne</span>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Niveau LuvviX</p>
              <p className="text-xl font-bold">Explorateur</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">XP</p>
              <p className="text-xl font-bold">1,250</p>
            </div>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
            <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
        <div className="grid grid-cols-1 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stat.label}</p>
                    <p className="text-sm text-gray-600">{stat.trend}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Activité récente */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 border-b border-gray-50 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Succès</h3>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
                !achievement.unlocked ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                    : 'bg-gray-100'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileProfile;
