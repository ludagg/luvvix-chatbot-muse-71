
// Simulating the IndexedDB service for file metadata and content caching

export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  created: Date;
  modified: Date;
  ipfsCid?: string;
  parentFolderId?: string;
  starred: boolean;
  tags: string[];
  encrypted: boolean;
  encryptionKey?: string;
  thumbnailUrl?: string;
  version: number;
}

class DBService {
  private dbName = 'luvvixCloudDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.error("Your browser doesn't support IndexedDB.");
        resolve(false);
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        resolve(false);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create 'files' object store for metadata
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('parentFolder', 'parentFolderId', { unique: false });
          filesStore.createIndex('starred', 'starred', { unique: false });
          filesStore.createIndex('type', 'type', { unique: false });
        }

        // Create 'fileContents' object store for cached file data
        if (!db.objectStoreNames.contains('fileContents')) {
          db.createObjectStore('fileContents', { keyPath: 'id' });
        }

        // Create 'sync' object store for multi-device sync logs
        if (!db.objectStoreNames.contains('syncLogs')) {
          const syncStore = db.createObjectStore('syncLogs', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getFileMetadata(id: string): Promise<FileMetadata | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        console.error('Error getting file metadata:', event);
        reject(new Error('Failed to get file metadata'));
      };
    });
  }

  async saveFileMetadata(metadata: FileMetadata): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(metadata);

      request.onsuccess = () => {
        resolve(metadata.id);
      };

      request.onerror = (event) => {
        console.error('Error saving file metadata:', event);
        reject(new Error('Failed to save file metadata'));
      };
    });
  }

  async getFileContent(id: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['fileContents'], 'readonly');
      const store = transaction.objectStore('fileContents');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result?.content || null);
      };

      request.onerror = (event) => {
        console.error('Error getting file content:', event);
        reject(new Error('Failed to get file content'));
      };
    });
  }

  async saveFileContent(id: string, content: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['fileContents'], 'readwrite');
      const store = transaction.objectStore('fileContents');
      const request = store.put({ id, content });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error saving file content:', event);
        reject(new Error('Failed to save file content'));
      };
    });
  }

  async listFiles(parentFolderId?: string): Promise<FileMetadata[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      if (parentFolderId !== undefined) {
        const index = store.index('parentFolder');
        const request = index.getAll(parentFolderId);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('Error listing files by folder:', event);
          reject(new Error('Failed to list files by folder'));
        };
      } else {
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('Error listing all files:', event);
          reject(new Error('Failed to list all files'));
        };
      }
    });
  }

  async deleteFile(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Delete metadata
      const metadataTransaction = this.db.transaction(['files'], 'readwrite');
      const metadataStore = metadataTransaction.objectStore('files');
      metadataStore.delete(id);

      // Delete content
      const contentTransaction = this.db.transaction(['fileContents'], 'readwrite');
      const contentStore = contentTransaction.objectStore('fileContents');
      contentStore.delete(id);

      resolve();
    });
  }
}

export const dbService = new DBService();
export default dbService;
