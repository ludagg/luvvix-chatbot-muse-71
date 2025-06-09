
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Authentification annulée ou échouée');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Paramètres manquants dans la réponse OAuth');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Session utilisateur non trouvée');
        }

        let functionName = '';
        if (state === 'gmail') {
          functionName = 'gmail-auth';
        } else if (state === 'outlook') {
          functionName = 'outlook-auth';
        } else {
          throw new Error('Provider non supporté');
        }

        const { data, error: functionError } = await supabase.functions.invoke(functionName, {
          body: {
            action: 'connect',
            authCode: code
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (functionError) throw functionError;

        if (data.success) {
          setStatus('success');
          setMessage(`Compte ${state} connecté avec succès`);
          
          toast({
            title: "Compte connecté",
            description: `Votre compte ${state} a été ajouté avec succès`
          });

          // Rediriger vers la page mail après 2 secondes
          setTimeout(() => {
            navigate('/mail');
          }, 2000);
        } else {
          throw new Error(data.error || 'Erreur inconnue');
        }

      } catch (error: any) {
        console.error('Erreur OAuth callback:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue');
        
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: error.message || 'Impossible de connecter le compte'
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Connexion en cours...';
      case 'success':
        return 'Connexion réussie !';
      case 'error':
        return 'Erreur de connexion';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message || 'Veuillez patienter pendant que nous configurons votre compte...'}
          </p>
          {status === 'error' && (
            <button
              onClick={() => navigate('/mail')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Retourner à LuvviX Mail
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
