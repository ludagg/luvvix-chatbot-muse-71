
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Crown, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  members_count: number;
  avatar_url?: string;
  is_member: boolean;
  is_private: boolean;
  is_admin?: boolean;
}

const GroupsWidget = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // Simulation de données pour la démo
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Développeurs LuvviX',
          description: 'Communauté des développeurs utilisant LuvviX',
          members_count: 1247,
          is_member: true,
          is_private: false,
          is_admin: true
        },
        {
          id: '2',
          name: 'Design UI/UX',
          description: 'Partage et discussions sur le design',
          members_count: 892,
          is_member: true,
          is_private: false
        },
        {
          id: '3',
          name: 'LuvviX Beta Testers',
          description: 'Groupe privé pour les testeurs beta',
          members_count: 156,
          is_member: false,
          is_private: true
        },
        {
          id: '4',
          name: 'JavaScript France',
          description: 'Communauté française de développeurs JS',
          members_count: 3456,
          is_member: false,
          is_private: false
        }
      ];
      
      setGroups(mockGroups);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupMembership = async (groupId: string) => {
    try {
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          const newIsMember = !group.is_member;
          const newMembersCount = newIsMember 
            ? group.members_count + 1 
            : group.members_count - 1;
          
          toast({
            title: newIsMember ? "Groupe rejoint" : "Groupe quitté",
            description: `Vous avez ${newIsMember ? 'rejoint' : 'quitté'} ${group.name}`
          });
          
          return {
            ...group,
            is_member: newIsMember,
            members_count: newMembersCount
          };
        }
        return group;
      }));
    } catch (error) {
      console.error('Erreur modification groupe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'adhésion au groupe"
      });
    }
  };

  const createGroup = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "La création de groupes sera bientôt disponible"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Groupes
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={createGroup}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {groups.slice(0, 4).map((group) => (
          <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {group.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                  {group.is_private && <Lock className="w-3 h-3 text-gray-500" />}
                  {group.is_admin && <Crown className="w-3 h-3 text-yellow-500" />}
                </div>
                <p className="text-xs text-gray-500 truncate">{group.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{group.members_count} membres</span>
                  {group.is_member && (
                    <Badge variant="secondary" className="text-xs">
                      Membre
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant={group.is_member ? "outline" : "default"}
              onClick={() => toggleGroupMembership(group.id)}
              className="ml-2"
            >
              {group.is_member ? 'Quitter' : 'Rejoindre'}
            </Button>
          </div>
        ))}
        
        {groups.length > 4 && (
          <Button variant="ghost" className="w-full text-sm">
            Voir tous les groupes ({groups.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupsWidget;
