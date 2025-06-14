
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Play, 
  Star,
  Clock,
  Zap,
  Target,
  Crown,
  Medal
} from 'lucide-react';

const CenterGames = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous', icon: Gamepad2 },
    { id: 'puzzle', label: 'Puzzle', icon: Target },
    { id: 'arcade', label: 'Arcade', icon: Zap },
    { id: 'strategy', label: 'Stratégie', icon: Crown },
    { id: 'trivia', label: 'Quiz', icon: Medal }
  ];

  const featuredGames = [
    {
      id: '1',
      title: 'LuvviX Puzzle Challenge',
      description: 'Résolvez des puzzles complexes avec l\'IA',
      category: 'puzzle',
      players: 1247,
      rating: 4.8,
      image: '/api/placeholder/300/200',
      isNew: true,
      playTime: '15 min'
    },
    {
      id: '2',
      title: 'Code Battle Arena',
      description: 'Défiez d\'autres développeurs en temps réel',
      category: 'strategy',
      players: 892,
      rating: 4.6,
      image: '/api/placeholder/300/200',
      isHot: true,
      playTime: '30 min'
    },
    {
      id: '3',
      title: 'AI Quiz Master',
      description: 'Testez vos connaissances sur l\'intelligence artificielle',
      category: 'trivia',
      players: 2156,
      rating: 4.9,
      image: '/api/placeholder/300/200',
      isFeatured: true,
      playTime: '10 min'
    },
    {
      id: '4',
      title: 'Speed Typing Race',
      description: 'Course de frappe en temps réel',
      category: 'arcade',
      players: 634,
      rating: 4.3,
      image: '/api/placeholder/300/200',
      isNew: false,
      playTime: '5 min'
    }
  ];

  const leaderboard = [
    {
      rank: 1,
      player: 'TechMaster_42',
      score: 15420,
      avatar: '',
      badge: 'crown'
    },
    {
      rank: 2,
      player: 'CodeNinja_X',
      score: 14890,
      avatar: '',
      badge: 'silver'
    },
    {
      rank: 3,
      player: 'AIWhisperer',
      score: 13765,
      avatar: '',
      badge: 'bronze'
    },
    {
      rank: 4,
      player: 'PixelPioneer',
      score: 12340,
      avatar: '',
      badge: null
    },
    {
      rank: 5,
      player: 'DataDragon',
      score: 11998,
      avatar: '',
      badge: null
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Victory',
      description: 'Gagnez votre premier jeu',
      icon: Trophy,
      unlocked: true,
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Speed Demon',
      description: 'Terminez un jeu en moins de 2 minutes',
      icon: Zap,
      unlocked: true,
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Perfect Score',
      description: 'Obtenez un score parfait',
      icon: Star,
      unlocked: false,
      rarity: 'legendary'
    }
  ];

  const filteredGames = activeCategory === 'all' 
    ? featuredGames 
    : featuredGames.filter(game => game.category === activeCategory);

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case 'crown':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'silver':
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 'bronze':
        return <Medal className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'rare':
        return 'text-blue-500';
      case 'legendary':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LuvviX Games
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jouez, apprenez et défiez la communauté
          </p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Jeu Aléatoire
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category.id)}
              className="gap-2"
            >
              <IconComponent className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Games Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGames.map((game) => (
              <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {game.isNew && <Badge className="bg-green-500">Nouveau</Badge>}
                    {game.isHot && <Badge className="bg-red-500">Populaire</Badge>}
                    {game.isFeatured && <Badge className="bg-purple-500">Vedette</Badge>}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90">
                      <Clock className="h-3 w-3 mr-1" />
                      {game.playTime}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{game.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{game.players}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full gap-2">
                    <Play className="h-4 w-4" />
                    Jouer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Classement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-lg">#{player.rank}</span>
                        {getBadgeIcon(player.badge)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.player.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{player.player}</p>
                        <p className="text-xs text-gray-500">{player.score.toLocaleString()} pts</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-sm">
                  Voir le classement complet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-purple-500" />
                Succès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-6 w-6 ${
                          achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${
                            achievement.unlocked ? 'text-green-900 dark:text-green-100' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${
                            achievement.unlocked ? 'text-green-700 dark:text-green-300' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-xs ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full text-sm">
                  Voir tous les succès
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CenterGames;
