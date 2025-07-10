
// Service de chiffrement pour la messagerie sécurisée
class EncryptionService {
  private keyPair: CryptoKeyPair | null = null;

  // Générer une paire de clés pour l'utilisateur
  async generateKeyPair(): Promise<CryptoKeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    this.keyPair = keyPair;
    return keyPair;
  }

  // Exporter la clé publique en format string
  async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(exported);
  }

  // Importer une clé publique depuis un string
  async importPublicKey(publicKeyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(publicKeyString);
    return await window.crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }

  // Exporter la clé privée en format string
  async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
    return this.arrayBufferToBase64(exported);
  }

  // Importer une clé privée depuis un string
  async importPrivateKey(privateKeyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(privateKeyString);
    return await window.crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt']
    );
  }

  // Chiffrer un message avec une clé publique
  async encryptMessage(message: string, publicKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
    
    return this.arrayBufferToBase64(encrypted);
  }

  // Déchiffrer un message avec la clé privée
  async decryptMessage(encryptedMessage: string, privateKey: CryptoKey): Promise<string> {
    const encryptedData = this.base64ToArrayBuffer(encryptedMessage);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Générer une clé symétrique pour les conversations de groupe
  async generateSymmetricKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Chiffrer avec une clé symétrique
  async encryptSymmetric(message: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return this.arrayBufferToBase64(combined);
  }

  // Déchiffrer avec une clé symétrique
  async decryptSymmetric(encryptedMessage: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedMessage);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Utilitaires de conversion
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Sauvegarder les clés dans le localStorage (à améliorer avec un stockage plus sécurisé)
  saveKeysToStorage(publicKey: string, privateKey: string) {
    localStorage.setItem('chat_public_key', publicKey);
    localStorage.setItem('chat_private_key', privateKey);
  }

  // Récupérer les clés du localStorage
  getKeysFromStorage(): { publicKey: string | null; privateKey: string | null } {
    return {
      publicKey: localStorage.getItem('chat_public_key'),
      privateKey: localStorage.getItem('chat_private_key'),
    };
  }
}

export const encryptionService = new EncryptionService();
