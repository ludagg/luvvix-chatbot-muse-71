
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Key, PlusCircle, Trash2, AppWindow, History } from "lucide-react";

// Secret token for admin access. In a real-world scenario, this would be more secure,
// potentially using an encrypted token or other means of secure authentication.
const ADMIN_SECRET = "luvvix-id-admin-secret-token";

const AdminPanel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [newApp, setNewApp] = useState({
    name: "",
    description: "",
    redirectUris: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token');
  
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Check if admin token is valid
      if (token === ADMIN_SECRET) {
        setAuthorized(true);
        await fetchApplications();
        await fetchConnections();
      } else {
        setAuthorized(false);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('application')
        .select('*')
        .order('createdat', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la liste des applications."
      });
    }
  };

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('appconnection')
        .select(`
          id,
          applicationid,
          userid,
          lastused,
          scopes,
          application:applicationid (name)
        `)
        .order('lastused', { ascending: false });
        
      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const redirectUris = newApp.redirectUris
        .split('\n')
        .map(uri => uri.trim())
        .filter(uri => uri.length > 0);
      
      if (newApp.name.length < 3) {
        throw new Error("Le nom de l'application doit contenir au moins 3 caractères.");
      }
      
      if (redirectUris.length === 0) {
        throw new Error("Au moins une URI de redirection est requise.");
      }

      // Génération d'un client ID et secret aléatoires
      const clientId = crypto.randomUUID();
      const clientSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const { error } = await supabase
        .from('application')
        .insert({
          name: newApp.name,
          description: newApp.description,
          redirecturis: redirectUris,
          clientid: clientId,
          clientsecret: clientSecret,
          createdat: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Application créée",
        description: `L'application "${newApp.name}" a été créée avec succès.`
      });
      
      setNewApp({
        name: "",
        description: "",
        redirectUris: ""
      });
      
      await fetchApplications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'application."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApp = async (appId: string, appName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'application "${appName}" ?\nCette action est irréversible.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('application')
        .delete()
        .eq('id', appId);
        
      if (error) throw error;
      
      toast({
        title: "Application supprimée",
        description: `L'application "${appName}" a été supprimée.`
      });
      
      await fetchApplications();
      await fetchConnections();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'application."
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Vous n'avez pas l'autorisation d'accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cette page est réservée aux administrateurs. Veuillez fournir un token d'accès valide.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/")} className="w-full">
                Retourner à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration LuvviX ID</h1>
              <p className="text-gray-600 mt-1">
                Gérez les applications et les connexions
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="connections">Connexions</TabsTrigger>
              <TabsTrigger value="new-app">Nouvelle application</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AppWindow className="h-5 w-5 text-purple-600" />
                    Applications enregistrées
                  </CardTitle>
                  <CardDescription>
                    Liste des applications autorisées à utiliser LuvviX ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.length === 0 ? (
                      <div className="text-center p-6">
                        <p className="text-gray-500">Aucune application enregistrée</p>
                      </div>
                    ) : (
                      applications.map(app => (
                        <div key={app.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {app.name}
                                <Badge className="bg-blue-500">{app.clientid}</Badge>
                              </h3>
                              <p className="text-sm text-gray-500">
                                Créée le {formatDate(app.createdat)}
                              </p>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="mt-2 md:mt-0"
                              onClick={() => handleDeleteApp(app.id, app.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="font-medium mb-1">Description</h4>
                              <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                                {app.description || "Pas de description"}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-1">Secret client</h4>
                              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                                <Key className="h-4 w-4 text-gray-500" />
                                <code className="text-xs">{app.clientsecret}</code>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-1">URLs de redirection autorisées</h4>
                            <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                              {(app.redirecturis || []).length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {app.redirecturis.map((uri: string, index: number) => (
                                    <li key={index} className="text-xs font-mono text-gray-700">
                                      {uri}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">Aucune URL définie</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="connections">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-600" />
                    Historique des connexions
                  </CardTitle>
                  <CardDescription>
                    Liste des connexions utilisateur par application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections.length === 0 ? (
                      <div className="text-center p-6">
                        <p className="text-gray-500">Aucune connexion enregistrée</p>
                      </div>
                    ) : (
                      connections.map(connection => (
                        <div key={connection.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{connection.application?.name || "Application inconnue"}</h3>
                              <p className="text-sm text-gray-500">
                                Utilisateur ID: {connection.userid}
                              </p>
                              <p className="text-sm text-gray-500">
                                Dernière utilisation: {formatDate(connection.lastused)}
                              </p>
                            </div>
                            <div>
                              <Badge className="bg-green-500">
                                {(connection.scopes || []).join(", ") || "profile"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="new-app">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-purple-600" />
                    Ajouter une nouvelle application
                  </CardTitle>
                  <CardDescription>
                    Enregistrez une nouvelle application qui pourra utiliser LuvviX ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateApp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'application</Label>
                      <Input
                        id="name"
                        value={newApp.name}
                        onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                        placeholder="LuvviX AI"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newApp.description}
                        onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                        placeholder="Une description de l'application..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="redirectUris">URLs de redirection (une par ligne)</Label>
                      <Textarea
                        id="redirectUris"
                        value={newApp.redirectUris}
                        onChange={(e) => setNewApp({ ...newApp, redirectUris: e.target.value })}
                        placeholder="https://luvvix-ai.com/oauth/callback"
                        rows={5}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Les URLs de redirection doivent être exactes, incluant le protocole (http/https) et le chemin.
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        "Créer l'application"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
