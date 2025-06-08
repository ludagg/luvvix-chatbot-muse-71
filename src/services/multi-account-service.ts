
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface StoredAccount {
  id: string;
  user_id: string;
  account_data: {
    email: string;
    full_name?: string;
    avatar_url?: string;
    last_login: string;
  };
  device_fingerprint: string;
  last_used_at: string;
}

class MultiAccountService {
  private deviceFingerprint: string;

  constructor() {
    this.deviceFingerprint = this.generateDeviceFingerprint();
  }

  private generateDeviceFingerprint(): string {
    // Générer une empreinte unique pour l'appareil
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  async getStoredAccounts(): Promise<StoredAccount[]> {
    try {
      const { data, error } = await supabase
        .from('stored_accounts')
        .select('*')
        .eq('device_fingerprint', this.deviceFingerprint)
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting stored accounts:', error);
      return [];
    }
  }

  async storeAccount(user: User): Promise<void> {
    try {
      const accountData = {
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        last_login: new Date().toISOString()
      };

      // Vérifier si le compte existe déjà
      const { data: existing } = await supabase
        .from('stored_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_fingerprint', this.deviceFingerprint)
        .single();

      if (existing) {
        // Mettre à jour le compte existant
        await supabase
          .from('stored_accounts')
          .update({
            account_data: accountData,
            last_used_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Créer un nouveau compte stocké
        await supabase
          .from('stored_accounts')
          .insert({
            user_id: user.id,
            account_data: accountData,
            device_fingerprint: this.deviceFingerprint,
            last_used_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error storing account:', error);
      throw error;
    }
  }

  async switchAccount(userId: string): Promise<boolean> {
    try {
      // Récupérer les données de session stockées
      const { data, error } = await supabase
        .from('user_sessions')
        .select('session_data')
        .eq('user_id', userId)
        .eq('device_id', this.deviceFingerprint)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('No active session found for user:', userId);
        return false;
      }

      // Restaurer la session
      const sessionData = data.session_data;
      const { error: authError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      });

      if (authError) {
        console.error('Error restoring session:', authError);
        return false;
      }

      // Mettre à jour le last_used
      await supabase
        .from('stored_accounts')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('device_fingerprint', this.deviceFingerprint);

      return true;
    } catch (error) {
      console.error('Error switching account:', error);
      return false;
    }
  }

  async saveSession(user: User, session: any): Promise<void> {
    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user_id: user.id
      };

      await supabase
        .from('user_sessions')
        .upsert({
          device_id: this.deviceFingerprint,
          user_id: user.id,
          session_data: sessionData,
          last_used: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'device_id,user_id'
        });

    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async removeAccount(userId: string): Promise<void> {
    try {
      // Supprimer le compte stocké
      await supabase
        .from('stored_accounts')
        .delete()
        .eq('user_id', userId)
        .eq('device_fingerprint', this.deviceFingerprint);

      // Désactiver la session
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_id', this.deviceFingerprint);

    } catch (error) {
      console.error('Error removing account:', error);
      throw error;
    }
  }

  async getAccountForQuickLogin(): Promise<StoredAccount[]> {
    const accounts = await this.getStoredAccounts();
    
    // Filtrer et retourner seulement les comptes avec sessions actives
    const activeAccounts = [];
    
    for (const account of accounts) {
      const { data } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', account.user_id)
        .eq('device_id', this.deviceFingerprint)
        .eq('is_active', true)
        .single();
      
      if (data) {
        activeAccounts.push(account);
      }
    }
    
    return activeAccounts;
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Supprimer les sessions expirées (plus de 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('device_id', this.deviceFingerprint)
        .lt('last_used', thirtyDaysAgo.toISOString());

    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

export const multiAccountService = new MultiAccountService();
export default multiAccountService;
