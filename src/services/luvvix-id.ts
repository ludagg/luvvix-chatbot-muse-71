
interface LuvvixAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  deviceFingerprint: string;
  lastUsed: Date;
}

interface SessionData {
  accountId: string;
  appId: string;
  permissions: string[];
  expiresAt: Date;
}

class LuvvixIDService {
  private accounts: Map<string, LuvvixAccount> = new Map();
  private currentSession: SessionData | null = null;
  private deviceFingerprint: string = '';

  constructor() {
    this.generateDeviceFingerprint();
    this.loadStoredAccounts();
  }

  // Génération d'empreinte d'appareil
  private generateDeviceFingerprint(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('LuvviX ID', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    this.deviceFingerprint = btoa(fingerprint).substring(0, 32);
  }

  // Authentification avec gestion intelligente de session
  async authenticate(email: string, password: string, appId: string = 'luvvix-web'): Promise<{ success: boolean; account?: LuvvixAccount; needsDeviceAuth?: boolean }> {
    try {
      // Vérifier si un compte existe déjà localement
      const existingAccount = this.findAccountByEmail(email);
      
      if (existingAccount && this.isValidSession(existingAccount)) {
        // Session existante valide - connexion automatique
        this.currentSession = {
          accountId: existingAccount.id,
          appId,
          permissions: ['read', 'write'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        };
        
        existingAccount.lastUsed = new Date();
        this.saveAccounts();
        
        return { success: true, account: existingAccount };
      }

      // Authentification via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          deviceFingerprint: this.deviceFingerprint,
          appId
        })
      });

      const authData = await response.json();

      if (!response.ok) {
        if (response.status === 403 && authData.needsDeviceAuth) {
          return { success: false, needsDeviceAuth: true };
        }
        throw new Error(authData.message || 'Authentication failed');
      }

      // Créer ou mettre à jour le compte local
      const account: LuvvixAccount = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name,
        avatar: authData.user.avatar,
        tokens: {
          accessToken: authData.tokens.accessToken,
          refreshToken: authData.tokens.refreshToken,
          expiresAt: new Date(authData.tokens.expiresAt)
        },
        deviceFingerprint: this.deviceFingerprint,
        lastUsed: new Date()
      };

      this.accounts.set(account.id, account);
      this.saveAccounts();

      // Créer la session
      this.currentSession = {
        accountId: account.id,
        appId,
        permissions: authData.permissions || ['read', 'write'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      return { success: true, account };

    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false };
    }
  }

  // Basculer entre comptes sans mot de passe
  async switchAccount(accountId: string, appId: string = 'luvvix-web'): Promise<{ success: boolean; account?: LuvvixAccount }> {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      return { success: false };
    }

    try {
      // Vérifier si le token est encore valide
      if (this.isValidSession(account)) {
        this.currentSession = {
          accountId: account.id,
          appId,
          permissions: ['read', 'write'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        account.lastUsed = new Date();
        this.saveAccounts();

        return { success: true, account };
      }

      // Rafraîchir le token si nécessaire
      const refreshed = await this.refreshToken(account);
      if (refreshed) {
        this.currentSession = {
          accountId: account.id,
          appId,
          permissions: ['read', 'write'],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        return { success: true, account };
      }

      return { success: false };

    } catch (error) {
      console.error('Switch account error:', error);
      return { success: false };
    }
  }

  // Obtenir la session actuelle
  getCurrentSession(): { account: LuvvixAccount | null; session: SessionData | null } {
    if (!this.currentSession) {
      return { account: null, session: null };
    }

    const account = this.accounts.get(this.currentSession.accountId) || null;
    return { account, session: this.currentSession };
  }

  // Lister les comptes disponibles sur l'appareil
  getAvailableAccounts(): LuvvixAccount[] {
    return Array.from(this.accounts.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  // SSO pour les applications tierces
  async authenticateForApp(appId: string, permissions: string[] = []): Promise<{ success: boolean; token?: string; account?: LuvvixAccount }> {
    const { account, session } = this.getCurrentSession();
    
    if (!account || !session || session.expiresAt < new Date()) {
      return { success: false };
    }

    try {
      // Générer un token spécifique à l'application
      const response = await fetch('/api/auth/app-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.tokens.accessToken}`
        },
        body: JSON.stringify({
          appId,
          permissions,
          sessionId: session.accountId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate app token');
      }

      const tokenData = await response.json();

      return {
        success: true,
        token: tokenData.token,
        account
      };

    } catch (error) {
      console.error('App authentication error:', error);
      return { success: false };
    }
  }

  // Déconnexion
  async signOut(accountId?: string): Promise<void> {
    if (accountId) {
      // Déconnexion d'un compte spécifique
      this.accounts.delete(accountId);
      if (this.currentSession?.accountId === accountId) {
        this.currentSession = null;
      }
    } else {
      // Déconnexion globale
      this.accounts.clear();
      this.currentSession = null;
    }

    this.saveAccounts();

    // Notifier le serveur
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          deviceFingerprint: this.deviceFingerprint
        })
      });
    } catch (error) {
      console.error('Logout notification error:', error);
    }
  }

  // Méthodes utilitaires
  private findAccountByEmail(email: string): LuvvixAccount | undefined {
    return Array.from(this.accounts.values()).find(account => account.email === email);
  }

  private isValidSession(account: LuvvixAccount): boolean {
    return account.tokens.expiresAt > new Date() && 
           account.deviceFingerprint === this.deviceFingerprint;
  }

  private async refreshToken(account: LuvvixAccount): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: account.tokens.refreshToken,
          deviceFingerprint: this.deviceFingerprint
        })
      });

      if (!response.ok) {
        return false;
      }

      const tokenData = await response.json();
      
      account.tokens = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: new Date(tokenData.expiresAt)
      };

      this.saveAccounts();
      return true;

    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  private loadStoredAccounts(): void {
    try {
      const stored = localStorage.getItem(`luvvix_accounts_${this.deviceFingerprint}`);
      if (stored) {
        const accountsData = JSON.parse(stored);
        accountsData.forEach((accountData: any) => {
          const account: LuvvixAccount = {
            ...accountData,
            tokens: {
              ...accountData.tokens,
              expiresAt: new Date(accountData.tokens.expiresAt)
            },
            lastUsed: new Date(accountData.lastUsed)
          };
          this.accounts.set(account.id, account);
        });
      }
    } catch (error) {
      console.error('Failed to load stored accounts:', error);
    }
  }

  private saveAccounts(): void {
    try {
      const accountsData = Array.from(this.accounts.values());
      localStorage.setItem(
        `luvvix_accounts_${this.deviceFingerprint}`,
        JSON.stringify(accountsData)
      );
    } catch (error) {
      console.error('Failed to save accounts:', error);
    }
  }

  // Sécurité et gestion des appareils
  async getDevices(): Promise<Array<{ id: string; name: string; lastUsed: Date; current: boolean }>> {
    try {
      const { account } = this.getCurrentSession();
      if (!account) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/auth/devices', {
        headers: {
          'Authorization': `Bearer ${account.tokens.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const devices = await response.json();
      
      return devices.map((device: any) => ({
        ...device,
        current: device.fingerprint === this.deviceFingerprint,
        lastUsed: new Date(device.lastUsed)
      }));

    } catch (error) {
      console.error('Get devices error:', error);
      return [];
    }
  }

  async revokeDevice(deviceId: string): Promise<boolean> {
    try {
      const { account } = this.getCurrentSession();
      if (!account) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/auth/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${account.tokens.accessToken}`
        }
      });

      return response.ok;

    } catch (error) {
      console.error('Revoke device error:', error);
      return false;
    }
  }
}

export const luvvixIDService = new LuvvixIDService();
export type { LuvvixAccount, SessionData };
