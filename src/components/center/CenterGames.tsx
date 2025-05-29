
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Play, 
  Crown, 
  Zap,
  Target,
  Puzzle,
  Brain
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Game {
  id: string;
  name: string;
  description: string;
  type: string;
  config: any;
  created_at: string;
}

interface GameRoom {
  id: string;
  game_id: string;
  created_by: string;
  max_players: number;
  current_players: number;
  status: string;
  created_at: string;
  center_games: {
    name: string;
    description: string;
    type: string;
  };
}

interface Score {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  metadata: any;
  created_at: string;
  user_profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

const CenterGames = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [activeTab, setActiveTab] = useState<'games' | 'rooms' | 'leaderboard'>('games');
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('center_games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('center_game_rooms')
        .select(`
          *,
          center_games(
            name,
            description,
            type
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('center_game_scores')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            username,
            avatar_url
          )
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGames(), fetchRooms(), fetchLeaderboard()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const createRoom = async (gameId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_game_rooms')
        .insert({
          game_id: gameId,
          created_by: user.id,
          max_players: 4,
          current_players: 1,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await supabase
        .from('center_game_participants')
        .insert({
          room_id: data.id,
          user_id: user.id,
          status: 'active'
        });

      toast({
        title: "Salon créé",
        description: "Votre salon de jeu a été créé avec succès"
      });

      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le salon"
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      // Add user as participant
      const { error } = await supabase
        .from('center_game_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          status: 'active'
        });

      if (error) throw error;

      // Update room player count using RPC function
      const { error: updateError } = await supabase
        .rpc('increment_room_players', { room_id: roomId });

      if (updateError) {
        console.error('Error updating room count:', updateError);
        // Fallback: manually update
        const { data: roomData } = await supabase
          .from('center_game_rooms')
          .select('current_players')
          .eq('id', roomId)
          .single();

        if (roomData) {
          await supabase
            .from('center_game_rooms')
            .update({ current_players: roomData.current_players + 1 })
            .eq('id', roomId);
        }
      }

      toast({
        title: "Salon rejoint",
        description: "Vous avez rejoint le salon de jeu"
      });

      fetchRooms();
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejoindre le salon"
      });
    }
  };

  const gameIcons = {
    quiz: Brain,
    puzzle: Puzzle,
    action: Zap,
    strategy: Target
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Centre de Jeux LuvviX
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Jouez, défiez vos amis et grimpez dans les classements !
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'games' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('games')}
          className="flex-1"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Jeux
        </Button>
        <Button
          variant={activeTab === 'rooms' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rooms')}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          Salons
        </Button>
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('leaderboard')}
          className="flex-1"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Classement
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'games' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun jeu disponible pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            games.map((game) => {
              const IconComponent = gameIcons[game.type as keyof typeof gameIcons] || Gamepad2;
              
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <IconComponent className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{game.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {game.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {game.description}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => createRoom(game.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Créer Salon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-4">
          {rooms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun salon de jeu disponible
                </p>
              </CardContent>
            </Card>
          ) : (
            rooms.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Gamepad2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {room.center_games.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {room.center_games.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            {room.current_players}/{room.max_players} joueurs
                          </Badge>
                          <Badge 
                            variant={room.status === 'waiting' ? 'default' : 'secondary'}
                          >
                            {room.status === 'waiting' ? 'En attente' : room.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => joinRoom(room.id)}
                      disabled={room.current_players >= room.max_players}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Rejoindre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Classement Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun score disponible
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900">
                        {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                        {index !== 0 && (
                          <span className="text-sm font-semibold text-purple-600">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={score.user_profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {score.user_profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {score.user_profiles.full_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{score.user_profiles.username}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {score.score.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CenterGames;
