
import { v4 as uuidv4 } from 'uuid';
import { dbService, FileMetadata } from './db-service';
import { encryptionService } from './encryption-service';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';
import { uploadFileToIPFS, getFileFromIPFS } from '@/hooks/use-ipfs';

export interface FileWithContent {
  metadata: FileMetadata;
  content: Blob;
}

class FileService {
  async uploadFile(
    file: File,
    parentFolderId?: string,
    tags: string[] = [],
    starred = false,
    encrypt = true
  ): Promise<string> {
    try {
      // Generate a unique ID for the file
      const fileId = uuidv4();
      
      // Encryption process if needed
      let processedBlob: Blob = file;
      let encryptionKey: string | undefined;
      let encryptionAlgorithm: 'AES' | 'ChaCha20' | undefined;
      
      if (encrypt) {
        const encryptionResult = await encryptionService.encryptFile(file);
        processedBlob = encryptionResult.encryptedBlob;
        encryptionKey = encryptionResult.key;
        encryptionAlgorithm = 'AES'; // Default to AES
      }
      
      // Upload to decentralized storage
      console.log("Uploading file to storage:", file.name);
      const ipfsCid = await uploadFileToIPFS(new File([processedBlob], file.name));
      
      if (!ipfsCid) {
        console.error("Failed to get CID for file:", file.name);
        throw new Error('Failed to upload file to decentralized storage');
      }
      
      console.log("File uploaded successfully, got CID:", ipfsCid);
      
      // Store file metadata in IndexedDB
      const fileMetadata: FileMetadata = {
        id: fileId,
        name: file.name,
        type: file.type || this.getFileTypeFromName(file.name),
        size: file.size,
        created: new Date(),
        modified: new Date(),
        ipfsCid,
        parentFolderId,
        starred,
        tags,
        encrypted: encrypt,
        encryptionKey,
        version: 1
      };
      
      // Save metadata to local IndexedDB
      await dbService.saveFileMetadata(fileMetadata);
      
      // Save content to local IndexedDB for offline access
      await dbService.saveFileContent(fileId, processedBlob);
      
      // Get current user for Supabase
      const user = await getCurrentUser();
      
      // Save to Supabase for cloud sync
      if (user && ipfsCid) {
        console.log("Saving file metadata to Supabase:", fileMetadata.name);
        const { error } = await supabase.from('cloud_files').insert({
          id: fileMetadata.id,
          name: fileMetadata.name,
          type: fileMetadata.type,
          size: fileMetadata.size,
          ipfs_cid: fileMetadata.ipfsCid,
          parent_folder_id: fileMetadata.parentFolderId,
          encryption_key: fileMetadata.encryptionKey,
          encryption_algorithm: fileMetadata.encrypted ? 'AES' : null,
          starred: fileMetadata.starred,
          tags: fileMetadata.tags,
          created_at: fileMetadata.created.toISOString(),
          modified_at: fileMetadata.modified.toISOString(),
          user_id: user.id
        });

        if (error) {
          console.error('Error saving to Supabase:', error);
          throw error;
        }

        // If it's a new version, save to version history
        if (fileMetadata.ipfsCid && fileMetadata.version > 1) {
          await supabase.from('file_versions').insert({
            file_id: fileMetadata.id,
            version_number: fileMetadata.version,
            ipfs_cid: fileMetadata.ipfsCid,
            size: fileMetadata.size,
            encryption_key: fileMetadata.encryptionKey
          });
        }
      } else {
        console.warn('No user found or IPFS CID missing, skipping Supabase sync');
      }
      
      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  async createFolder(
    name: string,
    parentFolderId?: string,
    tags: string[] = [],
    starred = false
  ): Promise<string> {
    try {
      // Generate a unique ID for the folder
      const folderId = uuidv4();
      
      // Create folder metadata
      const folderMetadata: FileMetadata = {
        id: folderId,
        name,
        type: 'folder',
        size: 0,
        created: new Date(),
        modified: new Date(),
        parentFolderId,
        starred,
        tags,
        encrypted: false,
        version: 1
      };
      
      // Save folder metadata locally
      await dbService.saveFileMetadata(folderMetadata);
      
      // Save folder metadata to Supabase
      await this.saveFileToSupabase(folderMetadata);
      
      return folderId;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }
  
  async saveFileToSupabase(fileMetadata: FileMetadata): Promise<void> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        console.warn('No user found, skipping Supabase sync');
        return;
      }
      
      const { error } = await supabase.from('cloud_files').insert({
        id: fileMetadata.id,
        name: fileMetadata.name,
        type: fileMetadata.type,
        size: fileMetadata.size,
        ipfs_cid: fileMetadata.ipfsCid,
        parent_folder_id: fileMetadata.parentFolderId,
        encryption_key: fileMetadata.encryptionKey,
        encryption_algorithm: fileMetadata.encrypted ? 'AES' : null,
        starred: fileMetadata.starred,
        tags: fileMetadata.tags,
        created_at: fileMetadata.created.toISOString(),
        modified_at: fileMetadata.modified.toISOString(),
        user_id: user.id
      });

      if (error) {
        throw error;
      }

      // If it's a new version, save to version history
      if (fileMetadata.ipfsCid && fileMetadata.version > 1) {
        await supabase.from('file_versions').insert({
          file_id: fileMetadata.id,
          version_number: fileMetadata.version,
          ipfs_cid: fileMetadata.ipfsCid,
          size: fileMetadata.size,
          encryption_key: fileMetadata.encryptionKey
        });
      }
    } catch (error) {
      console.error('Error saving file to Supabase:', error);
      throw error;
    }
  }
  
  async syncFilesFromSupabase(): Promise<void> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        console.warn('No user found, skipping Supabase sync');
        return;
      }
      
      console.log('Syncing files from Supabase for user:', user.id);
      
      const { data: files, error } = await supabase
        .from('cloud_files')
        .select('*')
        .eq('user_id', user.id); // Important filter - only current user's files
      
      if (error) {
        console.error('Error fetching files from Supabase:', error);
        throw error;
      }
      
      console.log(`Found ${files?.length || 0} files to sync from Supabase`);
      
      // Get all local files first to check what needs updating
      const localFiles = await dbService.listFiles();
      const localFileIds = new Set(localFiles.map(file => file.id));
      
      // Convert Supabase records to FileMetadata format and save to IndexedDB
      for (const file of files || []) {
        const fileMetadata: FileMetadata = {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          created: new Date(file.created_at),
          modified: new Date(file.modified_at),
          ipfsCid: file.ipfs_cid,
          parentFolderId: file.parent_folder_id,
          starred: file.starred,
          tags: file.tags || [], // Ensure tags is always an array
          encrypted: !!file.encryption_key,
          encryptionKey: file.encryption_key,
          version: 1 // Will be updated with versions info
        };
        
        // Save to IndexedDB
        await dbService.saveFileMetadata(fileMetadata);
        
        // If file doesn't exist locally or has no content, get it
        const needToFetchContent = !localFileIds.has(file.id) || !(await dbService.getFileContent(file.id));
        
        // If it's not a folder, fetch file content for offline access
        if (file.type !== 'folder' && file.ipfs_cid && needToFetchContent) {
          try {
            console.log(`Fetching content for file ${file.name} with CID: ${file.ipfs_cid}`);
            const content = await getFileFromIPFS(file.ipfs_cid);
            
            if (content) {
              console.log(`Content received for file ${file.name}, saving to local DB`);
              // If encrypted, don't decrypt here - we'll decrypt when needed
              await dbService.saveFileContent(file.id, content);
            } else {
              console.warn(`No content found for file ${file.name} with CID: ${file.ipfs_cid}`);
            }
          } catch (contentError) {
            console.error(`Error fetching content for ${file.name}:`, contentError);
            // Continue with other files even if one fails
          }
        } else if (file.type !== 'folder') {
          console.log(`Skipping content fetch for ${file.name}, already exists locally or no CID available`);
        }
      }
      
      // Fetch file versions
      const { data: versions, error: versionsError } = await supabase
        .from('file_versions')
        .select('*');
        
      if (versionsError) {
        console.error('Error fetching versions from Supabase:', versionsError);
        throw versionsError;
      }
      
      // Update version numbers in metadata
      for (const version of versions || []) {
        const fileMetadata = await dbService.getFileMetadata(version.file_id);
        if (fileMetadata && version.version_number > fileMetadata.version) {
          fileMetadata.version = version.version_number;
          await dbService.saveFileMetadata(fileMetadata);
        }
      }
      
      console.log('File synchronization completed successfully');
    } catch (error) {
      console.error('Error syncing files from Supabase:', error);
      throw error;
    }
  }
  
  async deleteFile(id: string): Promise<void> {
    try {
      // Delete from IndexedDB
      await dbService.deleteFile(id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('cloud_files')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
  
  async getFile(id: string): Promise<FileWithContent | null> {
    try {
      console.log(`Fetching file with ID: ${id}`);
      // Get metadata from IndexedDB
      const metadata = await dbService.getFileMetadata(id);
      
      if (!metadata) {
        console.warn(`No metadata found for file ID: ${id}`);
        return null;
      }
      
      console.log(`Metadata found for ${metadata.name}, type: ${metadata.type}`);
      
      // If it's a folder, return just the metadata
      if (metadata.type === 'folder') {
        return { metadata, content: new Blob() };
      }
      
      // Try to get content from IndexedDB first
      console.log(`Trying to get content from local DB for ${metadata.name}`);
      let content = await dbService.getFileContent(id);
      
      // If not in IndexedDB and we have IPFS CID, fetch from IPFS
      if (!content && metadata.ipfsCid) {
        console.log(`No local content found, fetching from decentralized storage with CID: ${metadata.ipfsCid}`);
        content = await getFileFromIPFS(metadata.ipfsCid);
        
        // Save to IndexedDB for future offline access
        if (content) {
          console.log(`Content retrieved from decentralized storage for ${metadata.name}, saving to local DB`);
          await dbService.saveFileContent(id, content);
        } else {
          console.warn(`Failed to retrieve content from decentralized storage for ${metadata.name}`);
        }
      }
      
      if (!content) {
        console.error(`Content not found for file ${metadata.name} (ID: ${id}, CID: ${metadata.ipfsCid})`);
        throw new Error('File content not found');
      }
      
      // Decrypt if necessary
      if (metadata.encrypted && metadata.encryptionKey) {
        console.log(`Decrypting encrypted file ${metadata.name}`);
        content = await encryptionService.decryptFile(content, metadata.encryptionKey);
      }
      
      console.log(`Successfully retrieved file ${metadata.name}, content size: ${content.size} bytes`);
      return { metadata, content };
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  }
  
  async updateFile(
    id: string,
    updates: {
      name?: string;
      starred?: boolean;
      tags?: string[];
      parentFolderId?: string;
    }
  ): Promise<void> {
    try {
      // Get current metadata
      const metadata = await dbService.getFileMetadata(id);
      
      if (!metadata) {
        throw new Error('File not found');
      }
      
      // Update metadata
      const updatedMetadata: FileMetadata = {
        ...metadata,
        ...updates,
        modified: new Date()
      };
      
      // Save to IndexedDB
      await dbService.saveFileMetadata(updatedMetadata);
      
      // Update Supabase
      const { error } = await supabase
        .from('cloud_files')
        .update({
          name: updatedMetadata.name,
          parent_folder_id: updatedMetadata.parentFolderId,
          starred: updatedMetadata.starred,
          tags: updatedMetadata.tags,
          modified_at: updatedMetadata.modified.toISOString()
        })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }
  
  async createSharedLink(fileId: string, expiresInDays: number): Promise<string> {
    try {
      const linkToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('shared_links')
        .insert({
          file_id: fileId,
          link_token: linkToken,
          expires_at: expiresAt.toISOString(),
          created_by: user.id
        });
        
      if (error) {
        console.error('Error creating shared link in Supabase:', error);
        throw error;
      }
      
      return linkToken;
    } catch (error) {
      console.error('Error creating shared link:', error);
      throw error;
    }
  }
  
  async isFileAvailable(fileId: string): Promise<boolean> {
    try {
      const file = await this.getFile(fileId);
      return file !== null && !!file.content;
    } catch (error) {
      console.error(`Error checking file availability for ${fileId}:`, error);
      return false;
    }
  }
  
  async exportFiles(): Promise<Blob> {
    try {
      // Get all file metadata
      const allFiles = await dbService.listFiles();
      
      // Prepare JSON structure for export
      const exportData: {
        metadata: FileMetadata[];
        contents: { id: string; blob: Blob }[];
      } = {
        metadata: allFiles,
        contents: []
      };
      
      // Add file contents (exclude folders)
      for (const file of allFiles) {
        if (file.type !== 'folder') {
          const content = await dbService.getFileContent(file.id);
          if (content) {
            exportData.contents.push({ id: file.id, blob: content });
          }
        }
      }
      
      // Convert to JSON (handle blobs separately in the UI)
      const exportBlob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
      return exportBlob;
    } catch (error) {
      console.error('Error exporting files:', error);
      throw error;
    }
  }
  
  async importFiles(importData: any): Promise<void> {
    try {
      // Import metadata
      for (const metadata of importData.metadata || []) {
        await dbService.saveFileMetadata(metadata);
      }
      
      // Import contents
      for (const content of importData.contents || []) {
        await dbService.saveFileContent(content.id, content.blob);
      }
      
      // Sync with Supabase
      for (const metadata of importData.metadata || []) {
        await this.saveFileToSupabase(metadata);
      }
    } catch (error) {
      console.error('Error importing files:', error);
      throw error;
    }
  }
  
  async listFiles(parentFolderId?: string): Promise<FileMetadata[]> {
    try {
      return await dbService.listFiles(parentFolderId);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
  
  private getFileTypeFromName(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (!ext) return 'application/octet-stream';
    
    const mimeTypes: {[key: string]: string} = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'zip': 'application/zip',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const fileService = new FileService();
export default fileService;
