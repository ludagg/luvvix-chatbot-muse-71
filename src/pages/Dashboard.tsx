import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Key, History, AppWindow, Loader2, Shield, User } from "lucide-react";
import AccountSelector from "@/components/AccountSelector";

interface AppAccess {
  id: string;
  app_name: string;
  granted_at: string;
  last_access: string;
}

const Dashboard = () => {
  const { user, profile, signOut, globalSignOut } = useAuth();
  const navigate = useNavigate();
  const [connectedApps, setConnectedApps] = useState<AppAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchConnectedApps();
    }
  }, [user, navigate]);
  
  const fetchConnectedApps = async () => {
    setLoading(true);
    try {
      const { data: authSession } = await supabase.auth.getSession();
      if (authSession.session) {
        const response = await fetch("https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api/get-user-apps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token: authSession.session.access_token })
        });
        
        const result = await response.json();
        if (result.success && result.data) {
          setConnectedApps(result.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des applications:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer vos applications connectées."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeAccess = async (appId: string, appName: string) => {
    if (!user) return;
    
    setRevokeLoading(appId);
    try {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) return;
      
      const response = await fetch("https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api/revoke-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          token: authSession.session.access_token,
          app_access_id: appId
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Accès révoqué",
          description: `L'accès à ${appName} a été révoqué avec succès.`
        });
        setConnectedApps(prevApps => prevApps.filter(app => app.id !== appId));
      } else {
        throw new Error(result.error || "Échec de la révocation");
      }
    } catch (error) {
      console.error("Erreur lors de la révocation de l'accès:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de révoquer l'accès à cette application."
      });
    } finally {
      setRevokeLoading(null);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getAppDisplayName = (appName: string) => {
    const appNames: {[key: string]: string} = {
      main: "LuvviX Principal",
      pharmacy: "LuvviX Pharmacy",
      streaming: "LuvviX Streaming",
      chat: "LuvviX Chat"
    };
    
    return appNames[appName] || appName;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {user && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                      <p className="text-gray-600 mt-1">
                        Bienvenue, {profile?.full_name || user.email}
                      </p>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="connected-apps" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="connected-apps">Applications connectées</TabsTrigger>
                      <TabsTrigger value="security">Sécurité</TabsTrigger>
                      <TabsTrigger value="profile">Profil</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="connected-apps">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AppWindow className="h-5 w-5 text-purple-600" />
                            Applications connectées
                          </CardTitle>
                          <CardDescription>
                            Voici les applications auxquelles vous avez accordé l'accès via LuvviX ID
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {loading ? (
                            <div className="text-center p-6">Chargement des applications...</div>
                          ) : connectedApps.length > 0 ? (
                            <div className="space-y-4">
                              {connectedApps.map((app) => (
                                <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{getAppDisplayName(app.app_name)}</h3>
                                      <Badge className="bg-green-500">{app.app_name}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      Accordé le {formatDate(app.granted_at)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Dernier accès: {formatDate(app.last_access)}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="mt-3 md:mt-0"
                                    onClick={() => handleRevokeAccess(app.id, getAppDisplayName(app.app_name))}
                                    disabled={revokeLoading === app.id}
                                  >
                                    {revokeLoading === app.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Révocation...
                                      </>
                                    ) : (
                                      "Révoquer l'accès"
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6 border rounded-lg bg-gray-50">
                              <p className="text-gray-500">Aucune application connectée</p>
                              <p className="text-sm text-gray-400 mt-2">
                                Les applications que vous autoriserez apparaîtront ici
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <div className="text-sm text-gray-500">
                            Pour connecter une nouvelle application, accédez à l'application et connectez-vous avec LuvviX ID.
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="security">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-600" />
                            Sécurité du compte
                          </CardTitle>
                          <CardDescription>
                            Gérez les paramètres de sécurité et les connexions récentes
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-3">Mot de passe</h3>
                              <Button variant="outline">Changer le mot de passe</Button>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                Connexions actives
                              </h3>
                              <div className="space-y-4">
                                <div className="border p-4 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">Session actuelle</p>
                                      <p className="text-sm text-gray-500">Connecté depuis {formatDate(new Date().toISOString())}</p>
                                    </div>
                                    <Badge>Active</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Connexions récentes
                              </h3>
                              <div className="border rounded-lg overflow-hidden">
                                <div className="p-4 border-b bg-gray-50">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">Aujourd'hui, {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</p>
                                      <p className="text-sm text-gray-500">Navigateur web</p>
                                    </div>
                                    <Badge>Vous</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-3">Déconnexion globale</h3>
                              <p className="text-sm text-gray-500 mb-3">
                                Déconnectez-vous de toutes les applications LuvviX en une seule fois
                              </p>
                              <Button 
                                variant="destructive" 
                                onClick={async () => {
                                  await globalSignOut();
                                  navigate('/');
                                }}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion globale
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="profile">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-600" />
                            Profil utilisateur
                          </CardTitle>
                          <CardDescription>
                            Gérez vos informations personnelles
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Email</p>
                              <p className="text-gray-700 bg-gray-100 p-2 rounded">{user.email}</p>
                            </div>
                            
                            {profile?.full_name && (
                              <div>
                                <p className="text-sm font-medium mb-1">Nom complet</p>
                                <p className="text-gray-700 bg-gray-100 p-2 rounded">{profile.full_name}</p>
                              </div>
                            )}
                            
                            {profile?.username && (
                              <div>
                                <p className="text-sm font-medium mb-1">Nom d'utilisateur</p>
                                <p className="text-gray-700 bg-gray-100 p-2 rounded">{profile.username}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button>Mettre à jour le profil</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4">Gestion de compte</h2>
                  <AccountSelector 
                    currentUser={{
                      id: user.id,
                      email: user.email || '',
                      avatarUrl: profile?.avatar_url || undefined,
                      fullName: profile?.full_name || undefined,
                    }}
                    onLogout={async () => {
                      await signOut();
                      return Promise.resolve();
                    }}
                  />
                  
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Liens rapides</h2>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/api-docs')}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Documentation pour développeurs
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
