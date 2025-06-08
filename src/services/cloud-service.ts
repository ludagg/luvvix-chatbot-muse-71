
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';

export interface CloudProvider {
  id: string;
  name: string;
  type: 'google_drive' | 'dropbox' | 'onedrive' | 'icloud';
  icon: string;
  color: string;
}

export interface CloudConnection {
  id: string;
  provider: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  account_info: any;
  is_active: boolean;
}

export interface CloudFile {
  id: string;
  name: string;
  path: string;
  provider_file_id: string;
  mime_type: string;
  size: number;
  is_starred: boolean;
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CloudFolder {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
  provider_folder_id: string;
  created_at: string;
  updated_at: string;
}

class CloudService {
  private providers: CloudProvider[] = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      type: 'google_drive',
      icon: 'https://developers.google.com/drive/images/drive_icon.png',
      color: '#4285F4'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      type: 'dropbox',
      icon: 'https://logos-world.net/wp-content/uploads/2020/11/Dropbox-Logo.png',
      color: '#0061FF'
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      type: 'onedrive',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg',
      color: '#0078D4'
    }
  ];

  getAvailableProviders(): CloudProvider[] {
    return this.providers;
  }

  async getUserConnection(): Promise<CloudConnection | null> {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('cloud_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user connection:', error);
      return null;
    }
  }

  async connectProvider(provider: string): Promise<string> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Vérifier si l'utilisateur a déjà une connexion
      const existingConnection = await this.getUserConnection();
      if (existingConnection) {
        throw new Error('Vous avez déjà un fournisseur connecté. Déconnectez-le d\'abord.');
      }

      // Générer l'URL d'autorisation OAuth
      const authUrl = await this.generateAuthUrl(provider);
      
      // Rediriger vers l'autorisation OAuth
      window.location.href = authUrl;
      
      return authUrl;
    } catch (error) {
      console.error('Error connecting provider:', error);
      throw error;
    }
  }

  private async generateAuthUrl(provider: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('cloud-oauth', {
      body: { 
        action: 'generate_auth_url',
        provider,
        redirect_uri: `${window.location.origin}/cloud/callback`
      }
    });

    if (error) throw error;
    return data.auth_url;
  }

  async handleOAuthCallback(code: string, state: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('cloud-oauth', {
        body: { 
          action: 'handle_callback',
          code,
          state,
          user_id: user.id
        }
      });

      if (error) throw error;

      // Sauvegarder la connexion en base
      await supabase.from('cloud_connections').insert({
        user_id: user.id,
        provider: data.provider,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        account_info: data.account_info
      });

    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  async disconnectProvider(): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('cloud_connections')
        .update({ is_active: false })
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error disconnecting provider:', error);
      throw error;
    }
  }

  async getFiles(folderId?: string): Promise<CloudFile[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const { data, error } = await supabase.functions.invoke('cloud-files', {
        body: { 
          action: 'list_files',
          provider: connection.provider,
          access_token: connection.access_token,
          folder_id: folderId
        }
      });

      if (error) throw error;
      return data.files;

    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  async getFolders(parentId?: string): Promise<CloudFolder[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const { data, error } = await supabase.functions.invoke('cloud-files', {
        body: { 
          action: 'list_folders',
          provider: connection.provider,
          access_token: connection.access_token,
          parent_id: parentId
        }
      });

      if (error) throw error;
      return data.folders;

    } catch (error) {
      console.error('Error getting folders:', error);
      throw error;
    }
  }

  async uploadFile(file: File, folderId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', connection.provider);
      formData.append('access_token', connection.access_token);
      if (folderId) formData.append('folder_id', folderId);

      const { error } = await supabase.functions.invoke('cloud-upload', {
        body: formData
      });

      if (error) throw error;

    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createFolder(name: string, parentId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const { error } = await supabase.functions.invoke('cloud-folders', {
        body: { 
          action: 'create_folder',
          provider: connection.provider,
          access_token: connection.access_token,
          name,
          parent_id: parentId
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

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const { error } = await supabase.functions.invoke('cloud-files', {
        body: { 
          action: 'delete_file',
          provider: connection.provider,
          access_token: connection.access_token,
          file_id: fileId
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const connection = await this.getUserConnection();
      if (!connection) throw new Error('Aucun fournisseur connecté');

      const { data, error } = await supabase.functions.invoke('cloud-download', {
        body: { 
          provider: connection.provider,
          access_token: connection.access_token,
          file_id: fileId
        }
      });

      if (error) throw error;
      
      // Convertir la réponse en blob
      return new Blob([data.content], { type: data.mime_type });

    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export const cloudService = new CloudService();
export default cloudService;
