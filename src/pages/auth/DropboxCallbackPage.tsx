
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
        // Appeler la fonction edge pour échanger le token
        const { data: sessionData } = await supabase.auth.getSession();
        
        const { data, error: functionError } = await supabase.functions.invoke('dropbox-oauth', {
          body: { action: 'exchange_token', code },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });
        
        if (functionError) {
          throw new Error(functionError.message);
        }

        if (data?.error) {
          throw new Error(data.error);
        }
        
        toast({
          title: "Dropbox connecté avec succès !",
          description: "Vous pouvez maintenant utiliser LuvviX Cloud",
        });
        
        navigate('/cloud');
        
      } catch (error: any) {
        console.error('Error connecting Dropbox:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message || "Impossible de connecter Dropbox",
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
