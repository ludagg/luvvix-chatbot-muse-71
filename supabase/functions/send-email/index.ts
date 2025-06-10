
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
    const { accountId, to, cc, bcc, subject, body, attachments } = await req.json();
    
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

    let result;

    if (account.provider === 'gmail') {
      result = await sendGmailEmail(account, { to, cc, bcc, subject, body, attachments });
    } else if (account.provider === 'outlook') {
      result = await sendOutlookEmail(account, { to, cc, bcc, subject, body, attachments });
    } else {
      throw new Error('Provider non supporté pour l\'envoi d\'emails');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.messageId,
      message: 'Email envoyé avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendGmailEmail(account: any, emailData: any) {
  const email = createRawEmail(account.email_address, emailData);
  
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: email }),
  });

  const result = await response.json();
  return { messageId: result.id };
}

async function sendOutlookEmail(account: any, emailData: any) {
  const message = {
    subject: emailData.subject,
    body: {
      contentType: 'HTML',
      content: emailData.body
    },
    toRecipients: emailData.to.map((email: string) => ({
      emailAddress: { address: email }
    })),
    ccRecipients: (emailData.cc || []).map((email: string) => ({
      emailAddress: { address: email }
    })),
    bccRecipients: (emailData.bcc || []).map((email: string) => ({
      emailAddress: { address: email }
    }))
  };

  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (response.ok) {
    return { messageId: 'sent' };
  } else {
    throw new Error('Erreur lors de l\'envoi avec Outlook');
  }
}

function createRawEmail(from: string, emailData: any) {
  const boundary = '----=_Part_0_' + Date.now();
  let email = '';
  
  email += `From: ${from}\r\n`;
  email += `To: ${emailData.to.join(', ')}\r\n`;
  if (emailData.cc && emailData.cc.length > 0) {
    email += `Cc: ${emailData.cc.join(', ')}\r\n`;
  }
  if (emailData.bcc && emailData.bcc.length > 0) {
    email += `Bcc: ${emailData.bcc.join(', ')}\r\n`;
  }
  email += `Subject: ${emailData.subject}\r\n`;
  email += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
  
  email += `--${boundary}\r\n`;
  email += `Content-Type: text/html; charset=UTF-8\r\n\r\n`;
  email += `${emailData.body}\r\n`;
  email += `--${boundary}--\r\n`;

  return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
