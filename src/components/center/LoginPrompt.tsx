
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react';

const LoginPrompt = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Le réseau social central de l'écosystème LuvviX
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Connectez-vous avec vos amis</CardTitle>
              <CardDescription>
                Retrouvez et connectez-vous avec des millions d'utilisateurs LuvviX
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Messagerie instantanée</CardTitle>
              <CardDescription>
                Chattez en temps réel avec des appels audio/vidéo intégrés
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 mx-auto text-pink-600 mb-4" />
              <CardTitle>Contenu personnalisé</CardTitle>
              <CardDescription>
                Timeline intelligente alimentée par l'IA pour du contenu pertinent
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6">
            <CardHeader className="text-center">
              <Share2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Partagez vos moments</CardTitle>
              <CardDescription>
                Partagez photos, vidéos, pensées avec votre communauté
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg">
              Rejoindre Center avec LuvviX ID
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
