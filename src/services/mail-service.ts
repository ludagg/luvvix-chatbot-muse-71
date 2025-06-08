
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';

export interface MailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  email_address: string;
  access_token?: string;
  refresh_token?: string;
  smtp_settings?: any;
  imap_settings?: any;
  is_default: boolean;
  is_active: boolean;
}

export interface Email {
  id: string;
  mail_account_id: string;
  message_id: string;
  subject: string;
  sender: any;
  recipients: any[];
  cc?: any[];
  bcc?: any[];
  body_text?: string;
  body_html?: string;
  attachments?: any[];
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  folder: string;
  received_at: string;
  created_at: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  message_count: number;
  last_message_at: string;
  is_read: boolean;
  emails: Email[];
}

class MailService {
  async getMailAccounts(): Promise<MailAccount[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting mail accounts:', error);
      return [];
    }
  }

  async connectMailAccount(provider: string, email: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      if (provider === 'gmail' || provider === 'outlook') {
        // OAuth flow pour Gmail et Outlook
        const authUrl = await this.generateMailAuthUrl(provider, email);
        window.location.href = authUrl;
      } else {
        // Configuration IMAP/SMTP pour les autres
        throw new Error('Configuration IMAP/SMTP non implémentée dans cette version');
      }
    } catch (error) {
      console.error('Error connecting mail account:', error);
      throw error;
    }
  }

  private async generateMailAuthUrl(provider: string, email: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('mail-oauth', {
      body: { 
        action: 'generate_auth_url',
        provider,
        email,
        redirect_uri: `${window.location.origin}/mail/callback`
      }
    });

    if (error) throw error;
    return data.auth_url;
  }

  async handleMailOAuthCallback(code: string, state: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('mail-oauth', {
        body: { 
          action: 'handle_callback',
          code,
          state,
          user_id: user.id
        }
      });

      if (error) throw error;

      // Vérifier si c'est le premier compte (sera par défaut)
      const existingAccounts = await this.getMailAccounts();
      const isDefault = existingAccounts.length === 0;

      // Sauvegarder le compte en base
      await supabase.from('mail_accounts').insert({
        user_id: user.id,
        provider: data.provider,
        email_address: data.email_address,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        is_default: isDefault
      });

    } catch (error) {
      console.error('Error handling mail OAuth callback:', error);
      throw error;
    }
  }

  async syncEmails(accountId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('mail-sync', {
        body: { 
          action: 'sync_emails',
          account_id: accountId,
          user_id: user.id
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  async getEmails(accountId?: string, folder: string = 'inbox', limit: number = 50): Promise<Email[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('emails')
        .select(`
          *,
          mail_accounts!inner(user_id)
        `)
        .eq('mail_accounts.user_id', user.id)
        .eq('folder', folder)
        .order('received_at', { ascending: false })
        .limit(limit);

      if (accountId) {
        query = query.eq('mail_account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting emails:', error);
      return [];
    }
  }

  async sendEmail(accountId: string, to: string[], subject: string, body: string, cc?: string[], bcc?: string[], attachments?: File[]): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('account_id', accountId);
      formData.append('to', JSON.stringify(to));
      formData.append('subject', subject);
      formData.append('body', body);
      if (cc) formData.append('cc', JSON.stringify(cc));
      if (bcc) formData.append('bcc', JSON.stringify(bcc));
      
      if (attachments) {
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const { error } = await supabase.functions.invoke('mail-send', {
        body: formData
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async markAsRead(emailId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  async markAsStarred(emailId: string, starred: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: starred })
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking email as starred:', error);
      throw error;
    }
  }

  async archiveEmail(emailId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_archived: true })
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving email:', error);
      throw error;
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  async searchEmails(query: string, accountId?: string): Promise<Email[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let dbQuery = supabase
        .from('emails')
        .select(`
          *,
          mail_accounts!inner(user_id)
        `)
        .eq('mail_accounts.user_id', user.id)
        .or(`subject.ilike.%${query}%,body_text.ilike.%${query}%,sender->name.ilike.%${query}%`)
        .order('received_at', { ascending: false })
        .limit(100);

      if (accountId) {
        dbQuery = dbQuery.eq('mail_account_id', accountId);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  }

  async getEmailThreads(): Promise<EmailThread[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Pour cette version, on groupe les emails par sujet
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          mail_accounts!inner(user_id)
        `)
        .eq('mail_accounts.user_id', user.id)
        .order('received_at', { ascending: false });

      if (error) throw error;

      // Grouper par sujet (version simplifiée)
      const threads: { [key: string]: EmailThread } = {};
      
      data?.forEach(email => {
        const threadKey = email.subject?.replace(/^(Re:|Fwd?:)\s*/gi, '').trim() || 'No Subject';
        
        if (!threads[threadKey]) {
          threads[threadKey] = {
            id: threadKey,
            subject: threadKey,
            participants: [],
            message_count: 0,
            last_message_at: email.received_at,
            is_read: true,
            emails: []
          };
        }

        threads[threadKey].emails.push(email);
        threads[threadKey].message_count++;
        threads[threadKey].is_read = threads[threadKey].is_read && email.is_read;
        
        if (new Date(email.received_at) > new Date(threads[threadKey].last_message_at)) {
          threads[threadKey].last_message_at = email.received_at;
        }

        // Ajouter participants uniques
        const senderEmail = email.sender?.email || email.sender?.address;
        if (senderEmail && !threads[threadKey].participants.includes(senderEmail)) {
          threads[threadKey].participants.push(senderEmail);
        }
      });

      return Object.values(threads).sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

    } catch (error) {
      console.error('Error getting email threads:', error);
      return [];
    }
  }
}

export const mailService = new MailService();
export default mailService;
