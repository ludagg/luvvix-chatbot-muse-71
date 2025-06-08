
interface CloudProvider {
  id: string;
  name: string;
  authUrl: string;
  scopes: string[];
  apiEndpoint: string;
}

interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  url?: string;
  parentId?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
}

interface CloudConnection {
  providerId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userInfo: {
    email: string;
    name: string;
    avatar?: string;
  };
}

class CloudProviderService {
  private providers: Map<string, CloudProvider> = new Map([
    ['google-drive', {
      id: 'google-drive',
      name: 'Google Drive',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      scopes: ['https://www.googleapis.com/auth/drive'],
      apiEndpoint: 'https://www.googleapis.com/drive/v3'
    }],
    ['onedrive', {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      scopes: ['https://graph.microsoft.com/Files.ReadWrite.All'],
      apiEndpoint: 'https://graph.microsoft.com/v1.0'
    }],
    ['dropbox', {
      id: 'dropbox',
      name: 'Dropbox',
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      scopes: ['files.content.write', 'files.content.read'],
      apiEndpoint: 'https://api.dropboxapi.com/2'
    }]
  ]);

  private connections: Map<string, CloudConnection> = new Map();

  async initiateOAuth(providerId: string): Promise<string> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not supported`);
    }

    const clientId = this.getClientId(providerId);
    const redirectUri = `${window.location.origin}/auth/callback/${providerId}`;
    const state = this.generateState();
    
    // Stocker l'état pour validation
    localStorage.setItem(`oauth_state_${providerId}`, state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state,
      access_type: 'offline', // Pour Google
      prompt: 'consent' // Pour forcer le refresh token
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(providerId: string, code: string, state: string): Promise<CloudConnection> {
    // Vérifier l'état
    const storedState = localStorage.getItem(`oauth_state_${providerId}`);
    if (storedState !== state) {
      throw new Error('Invalid OAuth state');
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not supported`);
    }

    try {
      // Échanger le code contre un token via notre edge function
      const response = await fetch('/api/oauth/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          code,
          redirectUri: `${window.location.origin}/auth/callback/${providerId}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange OAuth code');
      }

      const tokenData = await response.json();
      
      // Récupérer les infos utilisateur
      const userInfo = await this.getUserInfo(providerId, tokenData.access_token);

      const connection: CloudConnection = {
        providerId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        userInfo
      };

      this.connections.set(providerId, connection);
      
      // Stocker de manière sécurisée
      await this.storeConnection(connection);

      localStorage.removeItem(`oauth_state_${providerId}`);
      
      return connection;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  async listFiles(providerId: string, folderId?: string): Promise<CloudFile[]> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`Not connected to ${providerId}`);
    }

    switch (providerId) {
      case 'google-drive':
        return this.listGoogleDriveFiles(connection, folderId);
      case 'onedrive':
        return this.listOneDriveFiles(connection, folderId);
      case 'dropbox':
        return this.listDropboxFiles(connection, folderId);
      default:
        throw new Error(`Provider ${providerId} not implemented`);
    }
  }

  async uploadFile(providerId: string, file: File, parentId?: string): Promise<CloudFile> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`Not connected to ${providerId}`);
    }

    switch (providerId) {
      case 'google-drive':
        return this.uploadToGoogleDrive(connection, file, parentId);
      case 'onedrive':
        return this.uploadToOneDrive(connection, file, parentId);
      case 'dropbox':
        return this.uploadToDropbox(connection, file, parentId);
      default:
        throw new Error(`Provider ${providerId} not implemented`);
    }
  }

  async downloadFile(providerId: string, fileId: string): Promise<Blob> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`Not connected to ${providerId}`);
    }

    switch (providerId) {
      case 'google-drive':
        return this.downloadFromGoogleDrive(connection, fileId);
      case 'onedrive':
        return this.downloadFromOneDrive(connection, fileId);
      case 'dropbox':
        return this.downloadFromDropbox(connection, fileId);
      default:
        throw new Error(`Provider ${providerId} not implemented`);
    }
  }

  async deleteFile(providerId: string, fileId: string): Promise<void> {
    const connection = this.connections.get(providerId);
    if (!connection) {
      throw new Error(`Not connected to ${providerId}`);
    }

    switch (providerId) {
      case 'google-drive':
        return this.deleteFromGoogleDrive(connection, fileId);
      case 'onedrive':
        return this.deleteFromOneDrive(connection, fileId);
      case 'dropbox':
        return this.deleteFromDropbox(connection, fileId);
      default:
        throw new Error(`Provider ${providerId} not implemented`);
    }
  }

  // Implémentations spécifiques aux providers
  private async listGoogleDriveFiles(connection: CloudConnection, folderId?: string): Promise<CloudFile[]> {
    const query = folderId ? `'${folderId}' in parents` : "'root' in parents";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink)`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list Google Drive files');
    }

    const data = await response.json();
    
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      size: file.size ? parseInt(file.size) : undefined,
      modified: new Date(file.modifiedTime),
      thumbnailUrl: file.thumbnailLink,
      url: file.webViewLink
    }));
  }

  private async uploadToGoogleDrive(connection: CloudConnection, file: File, parentId?: string): Promise<CloudFile> {
    const metadata = {
      name: file.name,
      parents: parentId ? [parentId] : ['root']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error('Failed to upload to Google Drive');
    }

    const uploadedFile = await response.json();
    
    return {
      id: uploadedFile.id,
      name: uploadedFile.name,
      type: 'file',
      size: file.size,
      modified: new Date()
    };
  }

  private async downloadFromGoogleDrive(connection: CloudConnection, fileId: string): Promise<Blob> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download from Google Drive');
    }

    return response.blob();
  }

  private async deleteFromGoogleDrive(connection: CloudConnection, fileId: string): Promise<void> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete from Google Drive');
    }
  }

  // Méthodes utilitaires
  private getClientId(providerId: string): string {
    // En production, ces IDs seraient stockés de manière sécurisée
    const clientIds = {
      'google-drive': process.env.GOOGLE_DRIVE_CLIENT_ID,
      'onedrive': process.env.ONEDRIVE_CLIENT_ID,
      'dropbox': process.env.DROPBOX_CLIENT_ID
    };
    
    const clientId = clientIds[providerId as keyof typeof clientIds];
    if (!clientId) {
      throw new Error(`Client ID not configured for ${providerId}`);
    }
    
    return clientId;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async getUserInfo(providerId: string, accessToken: string): Promise<{ email: string; name: string; avatar?: string }> {
    switch (providerId) {
      case 'google-drive':
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userData = await response.json();
        return {
          email: userData.email,
          name: userData.name,
          avatar: userData.picture
        };
      
      default:
        return { email: '', name: '' };
    }
  }

  private async storeConnection(connection: CloudConnection): Promise<void> {
    // Stocker de manière chiffrée dans la base de données via Supabase
    // Pour la démo, on utilise le localStorage
    const connections = JSON.parse(localStorage.getItem('cloud_connections') || '[]');
    const existingIndex = connections.findIndex((c: any) => c.providerId === connection.providerId);
    
    if (existingIndex >= 0) {
      connections[existingIndex] = connection;
    } else {
      connections.push(connection);
    }
    
    localStorage.setItem('cloud_connections', JSON.stringify(connections));
  }

  // Méthodes pour OneDrive et Dropbox (implémentations similaires)
  private async listOneDriveFiles(connection: CloudConnection, folderId?: string): Promise<CloudFile[]> {
    // Implémentation OneDrive
    return [];
  }

  private async uploadToOneDrive(connection: CloudConnection, file: File, parentId?: string): Promise<CloudFile> {
    // Implémentation OneDrive
    throw new Error('OneDrive upload not implemented yet');
  }

  private async downloadFromOneDrive(connection: CloudConnection, fileId: string): Promise<Blob> {
    throw new Error('OneDrive download not implemented yet');
  }

  private async deleteFromOneDrive(connection: CloudConnection, fileId: string): Promise<void> {
    throw new Error('OneDrive delete not implemented yet');
  }

  private async listDropboxFiles(connection: CloudConnection, folderId?: string): Promise<CloudFile[]> {
    return [];
  }

  private async uploadToDropbox(connection: CloudConnection, file: File, parentId?: string): Promise<CloudFile> {
    throw new Error('Dropbox upload not implemented yet');
  }

  private async downloadFromDropbox(connection: CloudConnection, fileId: string): Promise<Blob> {
    throw new Error('Dropbox download not implemented yet');
  }

  private async deleteFromDropbox(connection: CloudConnection, fileId: string): Promise<void> {
    throw new Error('Dropbox delete not implemented yet');
  }
}

export const cloudProviderService = new CloudProviderService();
export type { CloudFile, CloudConnection, CloudProvider };
