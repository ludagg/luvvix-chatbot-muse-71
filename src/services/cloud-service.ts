
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';

export interface CloudProvider {
  id: string;
  name: string;
  type: 'google_drive' | 'dropbox' | 'onedrive' | 'icloud';
  access_token: string;
  refresh_token?: string;
  is_connected: boolean;
  last_sync: string;
  storage_used: number;
  storage_total: number;
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified_at: string;
  provider: string;
  path: string;
  mime_type?: string;
  download_url?: string;
  thumbnail_url?: string;
  is_shared: boolean;
}

export interface SyncStatus {
  provider: string;
  status: 'syncing' | 'completed' | 'error' | 'paused';
  progress: number;
  files_synced: number;
  total_files: number;
  last_update: string;
}

class CloudService {
  async getConnectedProviders(): Promise<CloudProvider[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cloud_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cloud providers:', error);
      return [];
    }
  }

  async connectProvider(providerType: string): Promise<string> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Generate OAuth URL based on provider
      const { data, error } = await supabase.functions.invoke('cloud-oauth', {
        body: { 
          action: 'generate_auth_url',
          provider: providerType,
          user_id: user.id,
          redirect_uri: `${window.location.origin}/cloud/callback`
        }
      });

      if (error) throw error;
      return data.auth_url;
    } catch (error) {
      console.error('Error connecting provider:', error);
      throw error;
    }
  }

  async handleOAuthCallback(code: string, state: string, provider: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('cloud-oauth', {
        body: { 
          action: 'handle_callback',
          code,
          state,
          provider,
          user_id: user.id
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  async syncProvider(providerId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('cloud-sync', {
        body: { 
          action: 'sync_provider',
          provider_id: providerId,
          user_id: user.id
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing provider:', error);
      throw error;
    }
  }

  async getFiles(providerId?: string, path: string = '/'): Promise<CloudFile[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('cloud_files')
        .select(`
          *,
          cloud_providers!inner(user_id)
        `)
        .eq('cloud_providers.user_id', user.id)
        .eq('path', path)
        .order('type', { ascending: false })
        .order('name');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  }

  async searchFiles(query: string, providerId?: string): Promise<CloudFile[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let dbQuery = supabase
        .from('cloud_files')
        .select(`
          *,
          cloud_providers!inner(user_id)
        `)
        .eq('cloud_providers.user_id', user.id)
        .ilike('name', `%${query}%`)
        .order('modified_at', { ascending: false })
        .limit(50);

      if (providerId) {
        dbQuery = dbQuery.eq('provider_id', providerId);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  async downloadFile(fileId: string): Promise<string> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('cloud-download', {
        body: { 
          file_id: fileId,
          user_id: user.id
        }
      });

      if (error) throw error;
      return data.download_url;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async uploadFile(providerId: string, file: File, path: string = '/'): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider_id', providerId);
      formData.append('path', path);
      formData.append('user_id', user.id);

      const { error } = await supabase.functions.invoke('cloud-upload', {
        body: formData
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createFolder(providerId: string, name: string, path: string = '/'): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('cloud-create-folder', {
        body: { 
          provider_id: providerId,
          name,
          path,
          user_id: user.id
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('cloud-delete', {
        body: { 
          file_id: fileId,
          user_id: user.id
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async shareFile(fileId: string, permissions: string[] = ['read']): Promise<string> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('cloud-share', {
        body: { 
          file_id: fileId,
          permissions,
          user_id: user.id
        }
      });

      if (error) throw error;
      return data.share_url;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }

  async getSyncStatus(): Promise<SyncStatus[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sync_status')
        .select(`
          *,
          cloud_providers!inner(user_id, name)
        `)
        .eq('cloud_providers.user_id', user.id)
        .order('last_update', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        provider: item.cloud_providers.name,
        status: item.status,
        progress: item.progress,
        files_synced: item.files_synced,
        total_files: item.total_files,
        last_update: item.last_update
      }));
    } catch (error) {
      console.error('Error getting sync status:', error);
      return [];
    }
  }

  async disconnectProvider(providerId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cloud_providers')
        .update({ is_connected: false })
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      throw error;
    }
  }

  async getStorageStats(): Promise<{totalUsed: number, totalAvailable: number, byProvider: {[key: string]: {used: number, total: number}}}> {
    try {
      const providers = await this.getConnectedProviders();
      
      let totalUsed = 0;
      let totalAvailable = 0;
      const byProvider: {[key: string]: {used: number, total: number}} = {};

      providers.forEach(provider => {
        totalUsed += provider.storage_used;
        totalAvailable += provider.storage_total;
        byProvider[provider.name] = {
          used: provider.storage_used,
          total: provider.storage_total
        };
      });

      return { totalUsed, totalAvailable, byProvider };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalUsed: 0, totalAvailable: 0, byProvider: {} };
    }
  }
}

export const cloudService = new CloudService();
export default cloudService;
