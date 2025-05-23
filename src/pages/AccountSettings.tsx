
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBiometrics } from "@/hooks/use-biometrics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Fingerprint, ShieldCheck, User, Mail, Key, Globe, Bell } from "lucide-react";

const AccountSettings = () => {
  useEffect(() => {
    document.title = "Paramètres du compte | LuvviX ID";
  }, []);

  const { user, profile, loading } = useAuth();
  const { isAvailable, isEnrolled, isLoading: biometricLoading, enrollBiometrics, removeBiometrics } = useBiometrics({
    onSuccess: () => {
      toast({
        title: "Opération réussie",
        description: "Vos paramètres biométriques ont été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      // Vérifier si l'utilisateur a déjà activé Authentivix
      setIsBiometricEnabled(isEnrolled);
    }
  }, [user, isEnrolled]);

  const handleToggleBiometrics = async () => {
    if (!user) return;

    if (isBiometricEnabled) {
      // Désactiver Authentivix
      const success = await removeBiometrics(user.id);
      if (success) {
        setIsBiometricEnabled(false);
      }
    } else {
      // Activer Authentivix
      const success = await enrollBiometrics(user.id);
      if (success) {
        setIsBiometricEnabled(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Chargement...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="mb-6">Vous devez être connecté pour accéder à cette page.</p>
            <Button onClick={() => window.location.href = "/auth"}>Se connecter</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Paramètres du compte</h1>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>Gérez votre compte LuvviX ID</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col items-start gap-1 w-full bg-transparent border-r h-auto p-0">
                    <TabsTrigger value="profile" className="w-full justify-start px-4 py-2">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profil</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="w-full justify-start px-4 py-2">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      <span>Sécurité</span>
                    </TabsTrigger>
                    <TabsTrigger value="authentivix" className="w-full justify-start px-4 py-2">
                      <Fingerprint className="h-4 w-4 mr-2" />
                      <span>Authentivix</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start px-4 py-2">
                      <Bell className="h-4 w-4 mr-2" />
                      <span>Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="w-full justify-start px-4 py-2">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Préférences</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du profil</CardTitle>
                    <CardDescription>
                      Mettez à jour vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nom complet</Label>
                          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{profile.full_name || "Non défini"}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Nom d'utilisateur</Label>
                          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{profile.username || "Non défini"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled>
                      <Save className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité du compte</CardTitle>
                    <CardDescription>
                      Gérez vos options de sécurité et vos appareils connectés
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mot de passe</Label>
                      <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                        <Key className="h-4 w-4 text-gray-500 mr-2" />
                        <span>••••••••••••</span>
                      </div>
                    </div>
                    <Button variant="outline">Changer de mot de passe</Button>
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-semibold">Authentification à deux facteurs</h3>
                    <div className="flex items-center space-x-2">
                      <Switch id="2fa" />
                      <Label htmlFor="2fa">Activer l'authentification à deux facteurs</Label>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-semibold">Activité récente</h3>
                    <div className="rounded-md border bg-card">
                      <div className="p-4 border-b">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Connexion</p>
                            <p className="text-sm text-muted-foreground">via {user.email}</p>
                          </div>
                          <div className="text-sm text-right">
                            <p>Aujourd'hui, 10:30</p>
                            <p className="text-muted-foreground">Paris, France</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="authentivix">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Fingerprint className="h-5 w-5 mr-2" />
                      Authentivix
                    </CardTitle>
                    <CardDescription>
                      Gérez votre authentification biométrique pour un accès rapide et sécurisé
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-2">État du système</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Biométrie disponible sur cet appareil</span>
                          {isAvailable ? (
                            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Disponible
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Non disponible
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Authentivix activé pour votre compte</span>
                          {isBiometricEnabled ? (
                            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Activé
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Désactivé
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAvailable ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-6">
                          <Switch 
                            id="authentivix-toggle" 
                            checked={isBiometricEnabled}
                            onCheckedChange={handleToggleBiometrics}
                            disabled={biometricLoading}
                          />
                          <Label htmlFor="authentivix-toggle" className="font-medium">
                            {isBiometricEnabled ? "Désactiver" : "Activer"} Authentivix
                          </Label>
                          {biometricLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Avantages d'Authentivix</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Connexion en un clic à votre compte</li>
                              <li>Plus besoin de saisir votre mot de passe</li>
                              <li>Sécurité renforcée grâce à la biométrie</li>
                              <li>Compatible avec l'écosystème LuvviX</li>
                            </ul>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Comment ça marche</h4>
                            <p className="text-sm">
                              Authentivix utilise les technologies biométriques natives de votre appareil
                              (empreinte digitale, reconnaissance faciale) pour vous authentifier de manière
                              rapide et sécurisée. Vos données biométriques ne quittent jamais votre appareil.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2 text-yellow-800">
                          Authentivix non disponible
                        </h3>
                        <p className="text-yellow-700">
                          Votre appareil ou navigateur ne prend pas en charge l'authentification biométrique.
                          Pour utiliser Authentivix, essayez un appareil ou navigateur compatible avec les
                          technologies WebAuthn.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Consulter l'historique d'utilisation
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences de notifications</CardTitle>
                    <CardDescription>
                      Configurez comment et quand vous souhaitez être notifié
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contenu des notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Emails de sécurité</h4>
                          <p className="text-sm text-gray-500">Recevez des notifications lors des connexions à votre compte</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Newsletter</h4>
                          <p className="text-sm text-gray-500">Restez informé des nouveautés de LuvviX</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Enregistrer les préférences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences régionales</CardTitle>
                    <CardDescription>
                      Configurez vos préférences de langue et de région
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Langue</Label>
                        <select className="w-full border rounded-md px-3 py-2">
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Région</Label>
                        <select className="w-full border rounded-md px-3 py-2">
                          <option value="fr">France</option>
                          <option value="ca">Canada</option>
                          <option value="be">Belgique</option>
                          <option value="ch">Suisse</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Enregistrer les préférences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;
