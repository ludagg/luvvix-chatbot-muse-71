
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Gamepad2, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Pass the current path as return_to parameter
    const returnTo = encodeURIComponent(location.pathname);
    navigate(`/auth?return_to=${returnTo}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Bienvenue sur LuvviX Center</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre réseau social et découvrir toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Messages</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Gamepad2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Jeux</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <User className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Profil</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Communauté</p>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            Se connecter avec LuvviX ID
          </Button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPrompt;
