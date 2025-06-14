
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Users, Settings, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MobileCenterGroupsProps {
  onBack: () => void;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members_count: number;
  avatar_url?: string;
  is_member: boolean;
  is_admin: boolean;
  created_at: string;
}

const MobileCenterGroups = ({ onBack }: MobileCenterGroupsProps) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');

  // Mock data for now since we don't have groups tables yet
  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Développeurs LuvviX',
      description: 'Communauté officielle des développeurs LuvviX',
      members_count: 1247,
      is_member: true,
      is_admin: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'AI Enthusiasts France',
      description: 'Passionnés d\'intelligence artificielle en France',
      members_count: 892,
      is_member: true,
      is_admin: false,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Startup Paris',
      description: 'Entrepreneurs et startups à Paris',
      members_count: 634,
      is_member: false,
      is_admin: false,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Design UI/UX',
      description: 'Communauté de designers créatifs',
      members_count: 456,
      is_member: false,
      is_admin: false,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // For now, use mock data
    setGroups(mockGroups);
    setLoading(false);
  }, []);

  const joinGroup = async (groupId: string) => {
    try {
      // TODO: Implement real join group functionality
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, is_member: true, members_count: group.members_count + 1 }
          : group
      ));
      
      toast({
        title: "Groupe rejoint",
        description: "Vous avez rejoint le groupe avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre le groupe",
        variant: "destructive"
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      // TODO: Implement real leave group functionality
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, is_member: false, members_count: group.members_count - 1 }
          : group
      ));
      
      toast({
        title: "Groupe quitté",
        description: "Vous avez quitté le groupe"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de quitter le groupe",
        variant: "destructive"
      });
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'my' ? group.is_member : !group.is_member;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Groupes</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un groupe..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'my'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Mes Groupes
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'discover'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Découvrir
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {activeTab === 'my' ? 'Aucun groupe rejoint' : 'Aucun groupe trouvé'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'my' 
                ? 'Rejoignez des groupes pour commencer !' 
                : 'Essayez une autre recherche'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {group.members_count.toLocaleString()} membres
                          </span>
                          {group.is_admin && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      {group.is_member ? (
                        <>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>Discuter</span>
                          </button>
                          {group.is_admin && (
                            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => leaveGroup(group.id)}
                            className="px-3 py-1.5 text-red-600 border border-red-200 rounded-full text-sm hover:bg-red-50"
                          >
                            Quitter
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => joinGroup(group.id)}
                          className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
                        >
                          Rejoindre
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCenterGroups;
