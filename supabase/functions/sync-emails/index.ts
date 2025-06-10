
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accountId, maxResults = 50 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Non autorisé');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer le compte de messagerie
    const { data: account, error: accountError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Compte de messagerie non trouvé');
    }

    let emails = [];

    if (account.provider === 'gmail') {
      emails = await syncGmailEmails(account, maxResults);
    } else if (account.provider === 'outlook') {
      emails = await syncOutlookEmails(account, maxResults);
    }

    // Sauvegarder les emails dans la base de données
    const emailsToInsert = emails.map(email => ({
      mail_account_id: account.id,
      message_id: email.messageId,
      thread_id: email.threadId,
      subject: email.subject,
      sender_email: email.senderEmail,
      sender_name: email.senderName,
      recipients: email.recipients,
      cc: email.cc || [],
      bcc: email.bcc || [],
      body_text: email.bodyText,
      body_html: email.bodyHtml,
      attachments: email.attachments || [],
      labels: email.labels || [],
      is_read: email.isRead,
      is_starred: email.isStarred,
      received_at: email.receivedAt
    }));

    if (emailsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('emails')
        .upsert(emailsToInsert, { 
          onConflict: 'message_id,mail_account_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Erreur lors de l\'insertion des emails:', insertError);
      }
    }

    // Mettre à jour la date de dernière synchronisation
    await supabase
      .from('mail_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    return new Response(JSON.stringify({ 
      success: true, 
      synced: emails.length,
      message: `${emails.length} emails synchronisés avec succès`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncGmailEmails(account: any, maxResults: number) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });

  const data = await response.json();
  const emails = [];

  if (data.messages) {
    for (const message of data.messages) {
      const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });

      const detail = await detailResponse.json();
      
      const headers = detail.payload.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const to = headers.find((h: any) => h.name === 'To')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';

      let bodyText = '';
      let bodyHtml = '';

      if (detail.payload.body?.data) {
        bodyText = atob(detail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (detail.payload.parts) {
        for (const part of detail.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            bodyHtml = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }
      }

      emails.push({
        messageId: detail.id,
        threadId: detail.threadId,
        subject,
        senderEmail: from.includes('<') ? from.match(/<(.+)>/)?.[1] || from : from,
        senderName: from.includes('<') ? from.split('<')[0].trim().replace(/"/g, '') : from,
        recipients: [to],
        bodyText,
        bodyHtml,
        isRead: !detail.labelIds?.includes('UNREAD'),
        isStarred: detail.labelIds?.includes('STARRED') || false,
        receivedAt: new Date(date).toISOString(),
        labels: detail.labelIds || []
      });
    }
  }

  return emails;
}

async function syncOutlookEmails(account: any, maxResults: number) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$orderby=receivedDateTime desc`, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });

  const data = await response.json();
  const emails = [];

  if (data.value) {
    for (const message of data.value) {
      emails.push({
        messageId: message.id,
        threadId: message.conversationId,
        subject: message.subject || '',
        senderEmail: message.from?.emailAddress?.address || '',
        senderName: message.from?.emailAddress?.name || '',
        recipients: message.toRecipients?.map((r: any) => r.emailAddress?.address) || [],
        bodyText: message.body?.contentType === 'text' ? message.body.content : '',
        bodyHtml: message.body?.contentType === 'html' ? message.body.content : '',
        isRead: message.isRead,
        isStarred: message.flag?.flagStatus === 'flagged',
        receivedAt: message.receivedDateTime,
        labels: message.categories || []
      });
    }
  }

  return emails;
}
