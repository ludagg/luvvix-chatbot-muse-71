
/**
 * Authentivix - Biometric authentication system for LuvviX ID
 * Version 1.1.0
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
        // @ts-ignore - This property exists but is not yet standardized
        if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
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
      // In a real implementation, we would use the WebAuthn API to register the credential
      // For this demo, we'll trigger a browser fingerprint prompt if available
      
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("Biometric authentication is not available on this device");
      }

      // For demo purposes, simulate WebAuthn credential creation
      // In a real implementation, this would call navigator.credentials.create()
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const challenge = this.bufferToBase64URLString(challengeBytes);
      
      // This would trigger the actual biometric prompt in a real implementation
      await this.simulateBiometricPrompt("Enroll your fingerprint for LuvviX ID");
      
      // After successful authentication, create a credential record
      const credential: BiometricCredential = {
        id: this.generateRandomId(),
        userId: userId,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        type: 'fingerprint'
      };
      
      localStorage.setItem(`${this.options.storageKey}_${userId}`, JSON.stringify(credential));
      console.log("Biometric enrollment successful:", credential);
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
      let userIdToUse = userId;
      if (!userIdToUse && this.options.autoPrompt) {
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
        userIdToUse = userIds[0];
      }
      
      if (!userIdToUse) {
        throw new Error("User ID required for biometric authentication");
      }
      
      // Check if the user has already set up biometric authentication
      if (!this.isEnrolled(userIdToUse)) {
        throw new Error("The user has not set up biometric authentication");
      }
      
      // In a real implementation, this would use navigator.credentials.get to verify the credential
      // For the demo, trigger a biometric verification prompt
      await this.simulateBiometricPrompt("Verify your fingerprint to continue");
      
      const storedDataStr = localStorage.getItem(`${this.options.storageKey}_${userIdToUse}`);
      if (!storedDataStr) {
        throw new Error("Biometric data not found");
      }
      
      const storedData: BiometricCredential = JSON.parse(storedDataStr);
      
      // Update last used date
      storedData.lastUsed = Date.now();
      localStorage.setItem(`${this.options.storageKey}_${userIdToUse}`, JSON.stringify(storedData));
      
      // Generate simulated token
      const simulatedToken = btoa(`${userIdToUse}:${Date.now()}`);
      console.log("Biometric authentication successful for user:", userIdToUse);
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

  /**
   * Helper function to generate a random ID
   * @returns {string} Random identifier
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Helper function to convert buffer to base64url string
   * @param {Uint8Array} buffer - The buffer to convert
   * @returns {string} Base64URL-encoded string
   */
  private bufferToBase64URLString(buffer: Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const byte of bytes) {
      str += String.fromCharCode(byte);
    }
    
    // Base64 encode
    const base64 = btoa(str);
    
    // Make base64 string URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Simulate a biometric prompt (in a real implementation, this would be triggered by WebAuthn)
   * @param {string} message - Message to show in the prompt
   * @returns {Promise<void>}
   */
  private async simulateBiometricPrompt(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';

      // Create prompt container
      const container = document.createElement('div');
      container.style.backgroundColor = 'white';
      container.style.borderRadius = '8px';
      container.style.padding = '24px';
      container.style.width = '320px';
      container.style.maxWidth = '90%';
      container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
      container.style.textAlign = 'center';

      // Title
      const title = document.createElement('h3');
      title.textContent = 'Biometric Authentication';
      title.style.margin = '0 0 16px 0';
      title.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      title.style.fontWeight = '600';

      // Message
      const messageEl = document.createElement('p');
      messageEl.textContent = message;
      messageEl.style.margin = '0 0 24px 0';
      messageEl.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      messageEl.style.fontSize = '14px';

      // Fingerprint icon
      const icon = document.createElement('div');
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11l5-1"></path>
          <path d="M5 12a5 5 0 0 0 5 5"></path>
          <path d="M13 12a5 5 0 0 0-3-5"></path>
          <path d="M15 6a5 5 0 0 1 2 4"></path>
          <path d="M18 11a5 5 0 0 0-5-5"></path>
          <path d="M12 19a2 2 0 0 1-2-2"></path>
          <path d="M20 12a2 2 0 0 1-2 2"></path>
          <path d="M14 14a2 2 0 0 1-2 2"></path>
          <path d="M16 16a2 2 0 0 1-2 2"></path>
        </svg>
      `;
      icon.style.margin = '0 0 24px 0';
      icon.style.animation = 'pulse 1.5s infinite';

      // Style animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(0.95); }
        }
      `;

      // Buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'space-between';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.padding = '8px 16px';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.style.backgroundColor = '#f3f4f6';
      cancelBtn.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      cancelBtn.style.cursor = 'pointer';

      const verifyBtn = document.createElement('button');
      verifyBtn.textContent = 'Verify';
      verifyBtn.style.padding = '8px 16px';
      verifyBtn.style.border = 'none';
      verifyBtn.style.borderRadius = '4px';
      verifyBtn.style.backgroundColor = '#6366F1';
      verifyBtn.style.color = 'white';
      verifyBtn.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      verifyBtn.style.cursor = 'pointer';

      // Append elements
      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(verifyBtn);
      container.appendChild(title);
      container.appendChild(messageEl);
      container.appendChild(icon);
      container.appendChild(buttonContainer);
      container.appendChild(style);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // Event handlers
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        reject(new Error('User cancelled biometric authentication'));
      };

      verifyBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve();
      };

      // Auto-close after a delay (simulating actual biometric verification)
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
          resolve();
        }
      }, 3000);
    });
  }
}

// Export a singleton instance for easy use
export const authentivix = new Authentivix();
export default authentivix;
