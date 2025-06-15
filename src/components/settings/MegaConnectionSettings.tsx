
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMegaConnections } from '@/hooks/use-mega-connections';
import { Link as LinkIcon, Unlink, Cloud, CheckCircle, AlertCircle, Shield } from 'lucide-react';

const MegaConnectionSettings = () => {
  const { 
    connections, 
    loading, 
    connectMega, 
    disconnectCloud, 
    isMegaConnected 
  } = useMegaConnections();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  const megaConnection = connections.find(conn => conn.provider === 'mega');

  const handleConnect = async () => {
    if (!email || !password) {
      return;
    }
    
    const result = await connectMega(email, password);
    if (result.success) {
      setEmail('');
      setPassword('');
      setShowForm(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Connexions cloud
        </CardTitle>
        <CardDescription>
          Gérez vos connexions aux services de stockage cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mega */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,10L12,14L8.5,10L12,6Z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2">
                Mega
                <div title="Chiffrement de bout en bout">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              </h3>
              <p className="text-sm text-gray-600">
                {isMegaConnected() 
                  ? `Connecté comme ${megaConnection?.account_info?.email || 'Utilisateur'}`
                  : 'Non connecté - 50GB gratuit avec chiffrement E2E'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isMegaConnected() ? (
              <>
                <Badge variant="secondary" className="text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => megaConnection && disconnectCloud(megaConnection.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Déconnecter
                </Button>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non connecté
                </Badge>
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  size="sm"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connecter
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Formulaire de connexion Mega */}
        {showForm && !isMegaConnected() && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-medium">Connecter votre compte Mega</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mega-email">Email Mega</Label>
                <Input
                  id="mega-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <Label htmlFor="mega-password">Mot de passe Mega</Label>
                <Input
                  id="mega-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnect}
                  disabled={loading || !email || !password}
                  className="flex-1"
                >
                  {loading ? 'Connexion...' : 'Connecter'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <Shield className="w-3 h-3 inline mr-1" />
              Vos identifiants sont chiffrés et sécurisés
            </div>
          </div>
        )}

        {/* Infos importantes */}
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pourquoi connecter Mega ?
          </h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• 50GB de stockage gratuit</li>
            <li>• Chiffrement de bout en bout</li>
            <li>• Confidentialité maximale</li>
            <li>• Accès depuis LuvviX Cloud</li>
            <li>• Synchronisation sécurisée</li>
          </ul>
        </div>

        {!isMegaConnected() && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">
                  Connexion requise
                </h4>
                <p className="text-sm text-orange-800">
                  Vous devez connecter votre Mega pour utiliser les fonctionnalités de stockage cloud de LuvviX.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegaConnectionSettings;
