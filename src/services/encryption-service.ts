
// Service for handling file encryption and decryption

export interface EncryptionResult {
  encryptedBlob: Blob;
  key: string;
}

class EncryptionService {
  // Generate a random encryption key
  private async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Convert CryptoKey to string for storage
  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }
  
  // Convert string back to CryptoKey
  private async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(keyString);
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // Convert ArrayBuffer to Base64 string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  // Convert Base64 string to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encrypt a file
  public async encryptFile(file: File | Blob): Promise<EncryptionResult> {
    try {
      // Generate encryption key
      const key = await this.generateKey();
      const keyString = await this.exportKey(key);
      
      // Generate a random IV (Initialization Vector)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Read file as ArrayBuffer
      const fileContent = await file.arrayBuffer();
      
      // Encrypt the file content
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        fileContent
      );
      
      // Combine IV and encrypted content
      const encryptedData = new Uint8Array(iv.length + encryptedContent.byteLength);
      encryptedData.set(iv, 0);
      encryptedData.set(new Uint8Array(encryptedContent), iv.length);
      
      // Return encrypted blob and key
      return {
        encryptedBlob: new Blob([encryptedData]),
        key: keyString
      };
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw error;
    }
  }

  // Decrypt a file
  public async decryptFile(encryptedBlob: Blob, keyString: string): Promise<Blob> {
    try {
      // Import the key
      const key = await this.importKey(keyString);
      
      // Read encrypted data
      const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());
      
      // Extract IV (first 12 bytes)
      const iv = encryptedData.slice(0, 12);
      
      // Extract encrypted content
      const encryptedContent = encryptedData.slice(12);
      
      // Decrypt the content
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encryptedContent
      );
      
      // Return decrypted blob
      return new Blob([decryptedContent]);
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw error;
    }
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
