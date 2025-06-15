
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const DropboxCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const handleDropboxCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: "L'autorisation Dropbox a été refusée",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
      if (!code) {
        toast({
          title: "Erreur",
          description: "Code d'autorisation manquant",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour lier Dropbox",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      
      try {
        // Échanger le code contre un token d'accès
        const response = await fetch('/api/dropbox/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'échange du token');
        }
        
        const { access_token, refresh_token, account_info } = await response.json();
        
        // Sauvegarder la connexion en base
        const { error: dbError } = await supabase
          .from('cloud_connections')
          .upsert({
            user_id: user.id,
            provider: 'dropbox',
            access_token,
            refresh_token,
            account_info,
            connected_at: new Date().toISOString(),
            is_active: true
          }, {
            onConflict: 'user_id,provider'
          });
        
        if (dbError) throw dbError;
        
        toast({
          title: "Dropbox connecté avec succès !",
          description: "Vous pouvez maintenant utiliser LuvviX Cloud",
        });
        
        navigate('/cloud');
        
      } catch (error) {
        console.error('Error connecting Dropbox:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de connecter Dropbox",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    };
    
    handleDropboxCallback();
  }, [searchParams, navigate, user]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connexion à Dropbox en cours...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous configurons votre accès cloud.
        </p>
      </div>
    </div>
  );
};

export default DropboxCallbackPage;
