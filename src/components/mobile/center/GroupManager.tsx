
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Users, Settings, MessageCircle, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  creator_id: string;
  is_private: boolean;
  members_count: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
}

interface GroupManagerProps {
  onBack: () => void;
}

const GroupManager = ({ onBack }: GroupManagerProps) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_private: false
  });

  const fetchGroups = async () => {
    if (!user) return;

    try {
      if (activeTab === 'my') {
        // Groupes de l'utilisateur
        const { data, error } = await supabase
          .from('center_groups')
          .select(`
            *,
            center_group_members!inner(role)
          `)
          .eq('center_group_members.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const groupsWithRole = (data || []).map(group => ({
          ...group,
          is_member: true,
          user_role: group.center_group_members[0]?.role
        }));

        setGroups(groupsWithRole);
      } else {
        // Groupes publics à découvrir
        const { data, error } = await supabase
          .from('center_groups')
          .select('*')
          .eq('is_private', false)
          .order('members_count', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Vérifier si l'utilisateur est membre
        const groupsWithMembership = await Promise.all(
          (data || []).map(async (group) => {
            const { data: memberData } = await supabase
              .from('center_group_members')
              .select('role')
              .eq('group_id', group.id)
              .eq('user_id', user.id)
              .single();

            return {
              ...group,
              is_member: !!memberData,
              user_role: memberData?.role
            };
          })
        );

        setGroups(groupsWithMembership);
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroup.name.trim()) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('center_groups')
        .insert({
          name: newGroup.name.trim(),
          description: newGroup.description.trim() || null,
          creator_id: user.id,
          is_private: newGroup.is_private
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Ajouter le créateur comme admin
      const { error: memberError } = await supabase
        .from('center_group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Groupe créé",
        description: "Votre groupe a été créé avec succès"
      });

      setShowCreateForm(false);
      setNewGroup({ name: '', description: '', is_private: false });
      fetchGroups();
    } catch (error) {
      console.error('Erreur création groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive"
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Groupe rejoint",
        description: "Vous avez rejoint le groupe avec succès"
      });

      fetchGroups();
    } catch (error) {
      console.error('Erreur rejoindre groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre le groupe",
        variant: "destructive"
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Groupe quitté",
        description: "Vous avez quitté le groupe"
      });

      fetchGroups();
    } catch (error) {
      console.error('Erreur quitter groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de quitter le groupe",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [activeTab, user]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Créer un groupe</h1>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du groupe *
            </label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Entrez le nom du groupe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre groupe..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="private"
              checked={newGroup.is_private}
              onChange={(e) => setNewGroup(prev => ({ ...prev, is_private: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="private" className="flex items-center space-x-2">
              {newGroup.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              <span>Groupe privé</span>
            </label>
          </div>

          <button
            onClick={createGroup}
            disabled={!newGroup.name.trim()}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Créer le groupe
          </button>
        </div>
      </div>
    );
  }

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
        <button onClick={() => setShowCreateForm(true)} className="p-2 hover:bg-gray-100 rounded-full">
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
            <p className="text-gray-500 text-sm mb-4">
              {activeTab === 'my' 
                ? 'Rejoignez des groupes pour commencer !' 
                : 'Essayez une autre recherche'
              }
            </p>
            {activeTab === 'my' && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600"
              >
                Créer un groupe
              </button>
            )}
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
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          {group.is_private ? (
                            <Lock className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {group.members_count} membre{group.members_count > 1 ? 's' : ''}
                          </span>
                          {group.user_role && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              group.user_role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : group.user_role === 'moderator'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {group.user_role === 'admin' ? 'Admin' : 
                               group.user_role === 'moderator' ? 'Modérateur' : 'Membre'}
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
                            <span>Accéder</span>
                          </button>
                          {(group.user_role === 'admin' || group.user_role === 'moderator') && (
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

export default GroupManager;
