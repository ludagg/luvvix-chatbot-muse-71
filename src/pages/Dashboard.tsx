
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Key, History, AppWindow, Loader2, Shield, User, Clock, Bell, Calendar, FileText, Cloud, Bot, Settings, ArrowRight } from "lucide-react";
import AccountSelector from "@/components/AccountSelector";
import AppGrid from "@/components/dashboard/AppGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";
import StatCards from "@/components/dashboard/StatCards";

interface AppAccess {
  id: string;
  app_name: string;
  granted_at: string;
  last_access: string;
}

const Dashboard = () => {
  const { user, profile, signOut, globalSignOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'ecosystem';
  const [connectedApps, setConnectedApps] = useState<AppAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [usageTime, setUsageTime] = useState({
    today: '2h 15m',
    week: '12h 45m',
    month: '42h 30m'
  });
  
  // Met à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
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

  const formatCurrentDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    };
    
    return date.toLocaleDateString('fr-FR', options);
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {user && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatCurrentDate(currentDateTime)} | {formatCurrentTime(currentDateTime)}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {getGreeting()}, {profile?.full_name || user.email?.split('@')[0]}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Bienvenue dans votre espace LuvviX
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
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
                </div>
              </div>
              
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Temps d'utilisation (aujourd'hui)</div>
                        <div className="text-xl font-semibold">{usageTime.today}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => navigate('/dashboard?tab=security')}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</div>
                        <div className="text-xl font-semibold">Aujourd'hui, 10:45</div>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">Active</Badge>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Prochaine tâche</div>
                        <div className="text-xl font-semibold">Aucune</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="ecosystem">LuvviX</TabsTrigger>
                  <TabsTrigger value="connected-apps">SSO</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ecosystem">
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AppWindow className="h-5 w-5 text-purple-600" />
                          Écosystème LuvviX
                        </CardTitle>
                        <CardDescription>
                          Accédez à toutes vos applications et services LuvviX
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AppGrid />
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Clock className="h-5 w-5 text-blue-600" />
                              Temps d'utilisation
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="text-sm text-gray-500 mb-1">Aujourd'hui</div>
                                <div className="text-2xl font-bold">{usageTime.today}</div>
                                <div className="mt-2 text-xs text-green-600">+15 minutes vs hier</div>
                              </div>
                              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="text-sm text-gray-500 mb-1">Cette semaine</div>
                                <div className="text-2xl font-bold">{usageTime.week}</div>
                                <div className="mt-2 text-xs text-green-600">+2h vs semaine dernière</div>
                              </div>
                              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="text-sm text-gray-500 mb-1">Ce mois</div>
                                <div className="text-2xl font-bold">{usageTime.month}</div>
                                <div className="mt-2 text-xs text-green-600">+5h vs mois dernier</div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Répartition par application</h4>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">AI Studio</span>
                                    <span className="text-sm">45%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Forms</span>
                                    <span className="text-sm">30%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Cloud</span>
                                    <span className="text-sm">15%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-sky-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Autres</span>
                                    <span className="text-sm">10%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="lg:col-span-1">
                        <RecentActivities userId={user.id} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
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
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        Pour connecter une nouvelle application, accédez à l'application et connectez-vous avec LuvviX ID.
                      </div>
                    </CardContent>
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="md:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AppWindow className="h-5 w-5 text-purple-600" />
                        Services rapides
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="flex-col h-auto py-6 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/ai-studio')}>
                          <Bot className="h-8 w-8 mb-2 text-purple-600" />
                          <span>AI Studio</span>
                        </Button>
                        
                        <Button variant="outline" className="flex-col h-auto py-6 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/forms')}>
                          <FileText className="h-8 w-8 mb-2 text-emerald-600" />
                          <span>Forms</span>
                        </Button>
                        
                        <Button variant="outline" className="flex-col h-auto py-6 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/cloud')}>
                          <Cloud className="h-8 w-8 mb-2 text-sky-600" />
                          <span>Cloud</span>
                        </Button>
                        
                        <Button variant="outline" className="flex-col h-auto py-6 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigate('/dashboard?tab=profile')}>
                          <Settings className="h-8 w-8 mb-2 text-gray-600" />
                          <span>Paramètres</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <StatCards userId={user.id} />
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
