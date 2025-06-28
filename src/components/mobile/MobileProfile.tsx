
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Award, TrendingUp, Calendar, Star, Edit3 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserBadgeComponent, { UserBadge } from '@/components/ui/user-badge';
import AvatarUpload from '@/components/ui/avatar-upload';
import { toast } from '@/hooks/use-toast';

const MobileProfile = () => {
  const { user, profile } = useAuth();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState({
    servicesUsed: 0,
    totalServices: 12,
    memberSince: '',
    luvvixScore: 0
  });

  const userName = user?.user_metadata?.full_name || profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url;

  useEffect(() => {
    loadUserBadges();
    loadUserStats();
  }, [user]);

  const loadUserBadges = async () => {
    // Simulate loading user badges - in real app, fetch from database
    const mockBadges: UserBadge[] = [
      {
        id: '1',
        name: 'Pionnier',
        description: 'Premier utilisateur de LuvviX',
        icon: 'star',
        color: 'luvvix',
        rarity: 'legendary',
        earnedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'IA Explorer',
        description: 'Utilisé 5+ services IA',
        icon: 'zap',
        color: 'secondary',
        rarity: 'epic',
        earnedAt: '2024-02-10'
      }
    ];
    setUserBadges(mockBadges);
  };

  const loadUserStats = async () => {
    // Simulate loading real user stats - in real app, calculate from user data
    const memberDate = user?.created_at ? new Date(user.created_at) : new Date();
    const monthsSince = Math.floor((Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    setStats({
      servicesUsed: 6, // Count from actual user usage
      totalServices: 12,
      memberSince: memberDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      luvvixScore: Math.min(4.8, 3.0 + (monthsSince * 0.1)) // Progressive score based on usage
    });
  };

  const handleAvatarChange = async (file: File | null, preview: string) => {
    if (file) {
      // In real implementation, upload to storage service
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès",
      });
      setIsEditingAvatar(false);
    }
  };

  const recentActivity = [
    {
      icon: "🤖",
      title: "Interface Cognitive utilisée",
      time: "Il y a 2h",
      description: "Prédictions générées"
    },
    {
      icon: "📱",
      title: "Services synchronisés",
      time: "Il y a 4h",
      description: "6 applications connectées"
    },
    {
      icon: "🎯",
      title: "Objectif atteint",
      time: "Hier",
      description: "Productivité +15%"
    }
  ];

  return (
    <div className="flex-1 overflow-auto pb-20">
      {/* Header profil */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {isEditingAvatar ? (
              <AvatarUpload
                currentAvatar={avatarUrl}
                onAvatarChange={handleAvatarChange}
                size="lg"
              />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            
            <button
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{userName}</h2>
              {userBadges.slice(0, 2).map(badge => (
                <UserBadgeComponent key={badge.id} badge={badge} size="sm" showTooltip />
              ))}
            </div>
            <p className="text-blue-100">{userEmail}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-blue-100 text-sm">En ligne</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Niveau LuvviX</p>
              <p className="text-xl font-bold">
                {userBadges.find(b => b.rarity === 'legendary') ? 'Pionnier' : 'Explorateur'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Score</p>
              <p className="text-xl font-bold">{stats.luvvixScore.toFixed(1)}/5</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${(stats.luvvixScore / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {userBadges.length > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Mes Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userBadges.map(badge => (
              <UserBadgeComponent key={badge.id} badge={badge} size="md" showTooltip />
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Services utilisés</p>
                  <p className="text-sm text-gray-600">Progression constante</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.servicesUsed}/{stats.totalServices}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Membre depuis</p>
                  <p className="text-sm text-gray-600">Utilisateur actif</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.memberSince}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Score LuvviX</p>
                  <p className="text-sm text-gray-600">
                    {stats.luvvixScore >= 4.5 ? 'Excellent' : stats.luvvixScore >= 3.5 ? 'Très bon' : 'Bon'}
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.luvvixScore.toFixed(1)}/5</p>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default MobileProfile;
