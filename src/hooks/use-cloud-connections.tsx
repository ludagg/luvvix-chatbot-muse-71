
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CloudConnection {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token?: string;
  account_info: any;
  connected_at: string;
  last_synced_at?: string;
  is_active: boolean;
}

export const useCloudConnections = () => {
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cloud_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching cloud connections:', error);
    }
  };

  const connectDropbox = async () => {
    setLoading(true);
    try {
      // Obtenir l'URL d'autorisation depuis notre edge function
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('dropbox-oauth', {
        body: { action: 'get_auth_url' },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      if (data?.auth_url) {
        // Rediriger vers l'URL d'autorisation
        window.location.href = data.auth_url;
      } else {
        throw new Error('Impossible d\'obtenir l\'URL d\'autorisation');
      }
    } catch (error: any) {
      console.error('Error connecting to Dropbox:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter à Dropbox",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectCloud = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('cloud_connections')
        .update({ is_active: false })
        .eq('id', connectionId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchConnections();
      toast({
        title: "Déconnexion réussie",
        description: "Le service cloud a été déconnecté"
      });
    } catch (error) {
      console.error('Error disconnecting cloud service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déconnecter le service",
        variant: "destructive"
      });
    }
  };

  const getDropboxConnection = () => {
    return connections.find(conn => conn.provider === 'dropbox');
  };

  const isDropboxConnected = () => {
    return !!getDropboxConnection();
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  return {
    connections,
    loading,
    connectDropbox,
    disconnectCloud,
    getDropboxConnection,
    isDropboxConnected,
    refetch: fetchConnections
  };
};
