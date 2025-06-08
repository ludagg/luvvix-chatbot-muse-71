
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface CloudRequest {
  provider: string;
  action: 'list' | 'upload' | 'download' | 'delete';
  accessToken: string;
  folderId?: string;
  fileId?: string;
  fileName?: string;
  fileContent?: string;
}

const PROVIDER_APIS = {
  'google-drive': {
    baseUrl: 'https://www.googleapis.com/drive/v3',
    uploadUrl: 'https://www.googleapis.com/upload/drive/v3',
  },
  'onedrive': {
    baseUrl: 'https://graph.microsoft.com/v1.0/me/drive',
  },
  'dropbox': {
    baseUrl: 'https://api.dropboxapi.com/2',
    contentUrl: 'https://content.dropboxapi.com/2',
  }
};

async function handleGoogleDrive(action: string, accessToken: string, params: any) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  switch (action) {
    case 'list':
      const folderId = params.folderId || 'root';
      const query = `'${folderId}' in parents and trashed=false`;
      const url = `${PROVIDER_APIS['google-drive'].baseUrl}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink)`;
      
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Google Drive API error: ${response.status}`);
      
      const data = await response.json();
      return data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType?.includes('folder') ? 'folder' : 'file',
        size: file.size ? parseInt(file.size) : undefined,
        modified: new Date(file.modifiedTime),
        thumbnailUrl: file.thumbnailLink,
        url: file.webViewLink
      }));

    case 'upload':
      const metadata = {
        name: params.fileName,
        parents: params.folderId ? [params.folderId] : ['root']
      };

      const uploadResponse = await fetch(`${PROVIDER_APIS['google-drive'].uploadUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: createMultipartBody(metadata, params.fileContent)
      });

      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.status}`);
      return await uploadResponse.json();

    default:
      throw new Error(`Action ${action} not implemented for Google Drive`);
  }
}

function createMultipartBody(metadata: any, content: string) {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  let body = delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) + delimiter +
    'Content-Type: application/octet-stream\r\n\r\n' +
    content + close_delim;

  return body;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { provider, action, accessToken, ...params }: CloudRequest = await req.json()
    
    console.log(`Processing ${action} for ${provider}`);

    let result;
    switch (provider) {
      case 'google-drive':
        result = await handleGoogleDrive(action, accessToken, params);
        break;
      default:
        throw new Error(`Provider ${provider} not implemented yet`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Cloud storage error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
