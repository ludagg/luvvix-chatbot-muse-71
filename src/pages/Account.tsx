
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from '@supabase/supabase-js';

const Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Utilisateur non trouvé');
      
      setUser(user);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      
      if (!user) throw new Error('Utilisateur non connecté');
      
      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Compte</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="preferences">Préférences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center mb-6">
                        <Avatar className="h-24 w-24">
                          <img 
                            src={avatarUrl || `https://ui-avatars.com/api/?name=${user?.email?.charAt(0) || 'U'}&background=random`} 
                            alt="Avatar"
                            onError={() => setAvatarUrl('')}
                          />
                        </Avatar>
                        <Button variant="outline" size="sm" className="mt-3">
                          Changer la photo
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={user?.email || ''} 
                            disabled
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Nom d'utilisateur</Label>
                          <Input 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setUsername('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button 
                          onClick={updateProfile}
                          disabled={updating}
                        >
                          {updating ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Changer le mot de passe</h3>
                        <p className="text-sm text-gray-500">
                          Vous pouvez changer votre mot de passe à tout moment.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Mot de passe actuel</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nouveau mot de passe</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      
                      <Button>Changer le mot de passe</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Préférences</h3>
                        <p className="text-sm text-gray-500">
                          Personnalisez votre expérience LuvviX.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing" className="font-medium">
                              Notifications marketing
                            </Label>
                            <p className="text-sm text-gray-500">
                              Recevez des emails sur les nouveaux produits et fonctionnalités.
                            </p>
                          </div>
                          <input
                            id="marketing"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="updates" className="font-medium">
                              Mises à jour du produit
                            </Label>
                            <p className="text-sm text-gray-500">
                              Soyez informé des nouvelles fonctionnalités et mises à jour.
                            </p>
                          </div>
                          <input
                            id="updates"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            defaultChecked
                          />
                        </div>
                      </div>
                      
                      <Button>Enregistrer les préférences</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-8 border-t pt-6">
            <Button variant="destructive" onClick={signOut}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
