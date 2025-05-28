
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Clock,
  Star,
  Play
} from 'lucide-react';

const CenterGames = () => {
  const games = [
    {
      id: 1,
      name: 'Quiz LuvviX',
      description: 'Testez vos connaissances sur l\'écosystème LuvviX',
      players: 234,
      category: 'Quiz',
      rating: 4.8,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Memory Game',
      description: 'Jeu de mémoire avec des cartes LuvviX',
      players: 156,
      category: 'Réflexion',
      rating: 4.6,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'Word Challenge',
      description: 'Défi de mots avec la communauté',
      players: 89,
      category: 'Mots',
      rating: 4.7,
      image: '/api/placeholder/300/200'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alice Martin', score: 2450, avatar: null },
    { rank: 2, name: 'Thomas Durand', score: 2340, avatar: null },
    { rank: 3, name: 'Sophie Laurent', score: 2200, avatar: null },
    { rank: 4, name: 'Vous', score: 1980, avatar: null, isMe: true },
  ];

  const achievements = [
    { name: 'Premier pas', description: 'Jouer votre premier jeu', unlocked: true },
    { name: 'Gamer', description: 'Jouer 10 parties', unlocked: true },
    { name: 'Champion', description: 'Gagner 5 parties consécutives', unlocked: false },
    { name: 'Légende', description: 'Atteindre le top 10', unlocked: false },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Mini-jeux Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Amusez-vous et défiez vos amis dans nos jeux communautaires
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 relative">
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Gamepad2 className="h-16 w-16 text-white" />
              </div>
              <Badge className="absolute top-4 left-4" variant="secondary">
                {game.category}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{game.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {game.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{game.players}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{game.rating}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Jouer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Classement global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((player) => (
                <div 
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.isMe ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      player.rank === 1 ? 'bg-yellow-500 text-white' :
                      player.rank === 2 ? 'bg-gray-400 text-white' :
                      player.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {player.rank}
                    </div>
                    <span className={player.isMe ? 'font-semibold' : ''}>
                      {player.name}
                    </span>
                  </div>
                  <span className="font-bold">{player.score} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-500" />
              Succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        achievement.unlocked ? 'text-green-700 dark:text-green-400' : ''
                      }`}>
                        {achievement.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Trophy className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CenterGames;
