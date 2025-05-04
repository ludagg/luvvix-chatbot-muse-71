
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Keyboard, Search, Moon, Share2, Wifi, Command, Accessibility } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDialogContext } from "@/contexts/DialogContext";

export default function Help() {
  const { toast } = useToast();
  const { setKeyboardShortcutsOpen, setCommandPaletteOpen } = useDialogContext();
  const [activeTab, setActiveTab] = useState("shortcuts");
  
  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Centre d'aide</h1>
      <p className="text-muted-foreground mb-8">
        Découvrez toutes les fonctionnalités disponibles dans LuvviX et apprenez à les utiliser efficacement.
      </p>
      
      <Tabs defaultValue="shortcuts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="shortcuts">
            <Keyboard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Raccourcis</span>
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Recherche</span>
          </TabsTrigger>
          <TabsTrigger value="themes">
            <Moon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Thèmes</span>
          </TabsTrigger>
          <TabsTrigger value="share">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Partage</span>
          </TabsTrigger>
          <TabsTrigger value="offline">
            <Wifi className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Mode hors-ligne</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Accessibility className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Accessibilité</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Raccourcis clavier</CardTitle>
              <CardDescription>
                Utilisez ces raccourcis pour naviguer rapidement dans l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>Palette de commandes</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Ctrl + K</kbd>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ouvre la palette de commandes pour exécuter rapidement des actions
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>Nouvelle conversation</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Alt + N</kbd>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Commence une nouvelle conversation
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>Enregistrer la conversation</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Alt + S</kbd>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sauvegarde la conversation actuelle
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>Changer de thème</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Alt + D</kbd>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bascule entre le mode clair et sombre
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => setKeyboardShortcutsOpen(true)}
              >
                Voir tous les raccourcis
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Recherche dans les conversations</CardTitle>
              <CardDescription>
                Trouvez rapidement des informations dans vos conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Recherche globale</h3>
                  <p className="text-muted-foreground mb-2">
                    Utilisez la barre de recherche en haut pour chercher dans toutes vos conversations
                  </p>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Alt + F</kbd>
                    <span className="text-sm text-muted-foreground">ou cliquez sur l'icône de recherche</span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Recherche dans la conversation actuelle</h3>
                  <p className="text-muted-foreground mb-2">
                    Pour chercher uniquement dans la conversation ouverte
                  </p>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">Ctrl + F</kbd>
                    <span className="text-sm text-muted-foreground">ouvre la recherche contextuelle</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation du thème</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application selon vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 text-center">
                  <div className="w-full h-24 bg-gradient-to-br from-background to-muted rounded-md mb-4"></div>
                  <h3 className="font-medium">Mode sombre</h3>
                  <p className="text-sm text-muted-foreground">Thème par défaut</p>
                </div>
                
                <div className="border rounded-md p-4 text-center">
                  <div className="w-full h-24 bg-gradient-to-br from-background to-muted rounded-md mb-4 theme-purple"></div>
                  <h3 className="font-medium">Thème violet</h3>
                  <p className="text-sm text-muted-foreground">Accent sur le violet</p>
                </div>
                
                <div className="border rounded-md p-4 text-center">
                  <div className="w-full h-24 bg-gradient-to-br from-background to-muted rounded-md mb-4 theme-blue"></div>
                  <h3 className="font-medium">Thème bleu</h3>
                  <p className="text-sm text-muted-foreground">Accent sur le bleu</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-muted-foreground">
                  Changez de thème en utilisant le sélecteur de thème dans la barre supérieure 
                  ou utilisez le raccourci <kbd className="px-1 bg-muted rounded text-xs">Alt + D</kbd>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Partage et exportation</CardTitle>
              <CardDescription>
                Partagez vos conversations ou exportez-les dans différents formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Options de partage</h3>
                  <p className="text-muted-foreground mb-2">
                    Partagez facilement vos conversations avec d'autres personnes
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Lien direct vers la conversation</li>
                    <li>Partage sur les réseaux sociaux</li>
                    <li>Envoi par email</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Formats d'exportation</h3>
                  <p className="text-muted-foreground mb-2">
                    Exportez vos conversations dans plusieurs formats
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>PDF avec mise en forme</li>
                    <li>Document Word (.docx)</li>
                    <li>Texte brut (.txt)</li>
                    <li>Markdown (.md)</li>
                    <li>HTML pour l'intégration web</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => {
                toast({
                  title: "Exportation",
                  description: "Les options d'exportation seront bientôt disponibles"
                });
              }}>
                Voir les options d'exportation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="offline">
          <Card>
            <CardHeader>
              <CardTitle>Mode hors-ligne</CardTitle>
              <CardDescription>
                Continuez à utiliser l'application même sans connexion internet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Fonctionnalités hors-ligne</h3>
                  <p className="text-muted-foreground mb-2">
                    Ce qui est disponible lorsque vous êtes déconnecté
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Accès à vos conversations sauvegardées</li>
                    <li>Consultation de vos messages précédents</li>
                    <li>Écriture de nouveaux messages (synchronisés plus tard)</li>
                    <li>Exportation de conversations</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Synchronisation automatique</h3>
                  <p className="text-muted-foreground">
                    Dès que vous êtes de nouveau connecté, vos données sont automatiquement 
                    synchronisées avec le serveur.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
              <CardDescription>
                Fonctionnalités pour rendre l'application accessible à tous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Options d'accessibilité</h3>
                  <p className="text-muted-foreground mb-2">
                    Personnalisez votre expérience pour une meilleure accessibilité
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Mode contraste élevé</li>
                    <li>Taille de police réglable</li>
                    <li>Compatibilité avec les lecteurs d'écran</li>
                    <li>Navigation au clavier</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Commandes vocales</h3>
                  <p className="text-muted-foreground">
                    Contrôlez l'application avec votre voix pour une expérience mains libres
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "Accessibilité",
                    description: "Les paramètres d'accessibilité seront bientôt disponibles"
                  });
                }}
              >
                Paramètres d'accessibilité
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Command className="h-4 w-4 mr-2" />
          Ouvrir la palette de commandes
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => setKeyboardShortcutsOpen(true)}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Voir les raccourcis clavier
        </Button>
      </div>
    </div>
  );
}
