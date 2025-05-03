
import { useState } from "react";
import { useCrossAuth } from "@/contexts/CrossAuthContext";
import { ChatContainer } from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Paintbrush, Star } from "lucide-react";
import { ConversationSelector } from "@/components/ConversationSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { ProFeatures } from "@/components/ProFeatures";
import { ProBadge } from "@/components/ProBadge";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";

// Schéma pour le profil
const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Le nom complet est requis" }),
  bio: z.string().optional(),
  website: z.string().url({ message: "URL invalide" }).optional().or(z.literal('')),
});

const Index = () => {
  const { user, login, logout, isLoading, isPro = false } = useCrossAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      bio: user?.user_metadata?.bio || "",
      website: user?.user_metadata?.website || "",
    },
  });

  const handleLogin = async () => {
    setError("");
    try {
      await login();
      setIsAuthDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    setError("");
    console.log("Update profile with:", values);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès",
    });
    setIsProfileDialogOpen(false);
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setIsAuthDialogOpen(true);
    setError("");
  };

  const handleOpenProfile = () => {
    if (user) {
      profileForm.reset({
        full_name: user.full_name || "",
        bio: user.user_metadata?.bio || "",
        website: user.user_metadata?.website || "",
      });
      setIsProfileDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-gradient-to-b from-background via-background to-background/90 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10%] opacity-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenProfile={handleOpenProfile}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <main className="flex flex-col flex-grow relative z-10 overflow-hidden pt-16">
        {!user && (
          <div className="text-center mt-4 mb-2 px-4 md:mb-4">
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              Connectez-vous avec LuvviX ID pour sauvegarder vos discussions
            </p>
            <div className="flex justify-center gap-3 md:gap-4">
              <Button size={isMobile ? "sm" : "default"} onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Chargement..." : "Se connecter avec LuvviX ID"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 h-full w-full max-w-5xl mx-auto px-2 md:px-4 pb-2">
          <div className="h-full flex flex-col bg-gradient-to-b from-background/50 via-background/80 to-background rounded-xl md:rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 py-2 text-center"></footer>

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>
              Connexion avec LuvviX ID
            </DialogTitle>
            <DialogDescription>
              Connectez-vous avec LuvviX ID pour accéder à tous les services LuvviX
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter avec LuvviX ID"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Modifier votre profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Quelques mots à propos de vous" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://votre-site.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Enregistrer"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProModalOpen} onOpenChange={setIsProModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span>LuvviX AI Pro</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              Débloquez toutes les fonctionnalités avancées
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <ProFeatures />
            
            <Button 
              className="w-full"
              variant="default"
              onClick={() => {
                console.log("Open payment modal");
                setIsProModalOpen(false);
                toast({
                  title: "Bientôt disponible",
                  description: "La version Pro sera disponible prochainement. Restez à l'écoute !",
                });
              }}
            >
              Passer à Pro - 9.99€/mois
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
