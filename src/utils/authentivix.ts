
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 1.0.0
 */

// Types for the biometric authentication system
export interface BiometricCredential {
  id: string;
  userId: string;
  createdAt: number;
  lastUsed: number;
  type: 'fingerprint' | 'face' | 'other';
}

export interface AuthentivixOptions {
  apiUrl?: string;
  storageKey?: string;
  autoPrompt?: boolean;
}

// Main class for biometric authentication management
export class Authentivix {
  private options: Required<AuthentivixOptions>;
  
  constructor(options?: AuthentivixOptions) {
    this.options = {
      apiUrl: 'https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api',
      storageKey: 'luvvix_biometrics',
      autoPrompt: false,
      ...options
    };
  }
  
  /**
   * Check if biometric authentication is available on the device
   * @returns {Promise<boolean>} True if available, False otherwise
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      // Check if the Web Authentication API is available
      if (window && 'PublicKeyCredential' in window) {
        // Check if the device supports biometric authentication
        // Note: This API is still experimental and may require adaptations
        if ('PublicKeyCredential' in window &&
            // @ts-ignore - This property exists but is not yet standardized
            typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          // @ts-ignore
          return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }
  
  /**
   * Check if the user has already set up biometric authentication
   * @param {string} userId - User identifier
   * @returns {boolean} True if configured, False otherwise
   */
  isEnrolled(userId: string): boolean {
    try {
      const storedData = localStorage.getItem(`${this.options.storageKey}_${userId}`);
      return !!storedData;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }
  
  /**
   * Register the user's biometric data
   * @param {string} userId - User identifier
   * @param {string} token - Authentication token
   * @returns {Promise<boolean>} True if registration succeeds, False otherwise
   */
  async enrollBiometrics(userId: string, token: string): Promise<boolean> {
    try {
      // In a production environment, this operation would be performed with the server
      // and the Web Authentication API (navigator.credentials.create)
      
      // Simulate registration for the demo
      const credential: BiometricCredential = {
        id: Math.random().toString(36).substring(2, 15),
        userId: userId,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        type: 'fingerprint'
      };
      
      localStorage.setItem(`${this.options.storageKey}_${userId}`, JSON.stringify(credential));
      return true;
    } catch (error) {
      console.error('Error during biometric registration:', error);
      return false;
    }
  }
  
  /**
   * Authenticate the user with their biometric data
   * @param {string} userId - User identifier (optional if autoPrompt is true)
   * @returns {Promise<string|null>} Authentication token or null if failed
   */
  async authenticateWithBiometrics(userId?: string): Promise<string | null> {
    try {
      // Check if biometric authentication is available
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("Biometric authentication is not available on this device");
      }
      
      // If userId is not provided and autoPrompt is enabled, look for all stored credentials
      if (!userId && this.options.autoPrompt) {
        // Browse localStorage to find biometric credentials
        const userIds: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(this.options.storageKey + '_')) {
            const extractedUserId = key.replace(this.options.storageKey + '_', '');
            userIds.push(extractedUserId);
          }
        }
        
        if (userIds.length === 0) {
          throw new Error("No biometric data registered");
        }
        
        // Use the first user found
        userId = userIds[0];
      }
      
      if (!userId) {
        throw new Error("User ID required for biometric authentication");
      }
      
      // Check if the user has already set up biometric authentication
      if (!this.isEnrolled(userId)) {
        throw new Error("The user has not set up biometric authentication");
      }
      
      // In a production environment, this operation would be performed with the server
      // and the Web Authentication API (navigator.credentials.get)
      
      // Simulate authentication for the demo
      const storedDataStr = localStorage.getItem(`${this.options.storageKey}_${userId}`);
      if (!storedDataStr) {
        throw new Error("Biometric data not found");
      }
      
      const storedData: BiometricCredential = JSON.parse(storedDataStr);
      
      // Update last used date
      storedData.lastUsed = Date.now();
      localStorage.setItem(`${this.options.storageKey}_${userId}`, JSON.stringify(storedData));
      
      // Generate simulated token
      const simulatedToken = btoa(`${userId}:${Date.now()}`);
      return simulatedToken;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return null;
    }
  }
  
  /**
   * Remove the user's biometric data
   * @param {string} userId - User identifier
   * @returns {boolean} True if removal succeeds, False otherwise
   */
  removeBiometrics(userId: string): boolean {
    try {
      localStorage.removeItem(`${this.options.storageKey}_${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing biometric data:', error);
      return false;
    }
  }
}

// Export a singleton instance for easy use
export const authentivix = new Authentivix();
export default authentivix;
