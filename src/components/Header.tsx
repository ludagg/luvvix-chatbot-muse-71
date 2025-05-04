import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, User, Settings, LogOut, Star, Paintbrush } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DiscussionsMenu } from "@/components/DiscussionsMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationSearch } from "@/components/ConversationSearch";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { NotificationCenter } from "@/components/NotificationCenter";

// Ajouter ces importations
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { VisionAnalysis } from "@/components/VisionAnalysis";
import { ShareOptions } from "@/components/ShareOptions";
import { AdvancedVoiceSettings } from "@/components/AdvancedVoiceSettings";

interface HeaderProps {
  onOpenAuth: (mode: "login" | "register") => void;
  onOpenProfile: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

function getInitials(user: any) {
  if (!user || !user.displayName) return "XX";
  const nameParts = user.displayName.split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials;
}

export function Header({ onOpenAuth, onOpenProfile, isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { user, logout, isPro = false } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMuted, setIsMuted] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const handleOpenSettings = () => {
    toast({
      title: "Paramètres",
      description: "Les paramètres seront disponibles prochainement",
    });
  };

  const handleProUpgrade = () => {
    toast({
      title: "Bientôt disponible",
      description: "La version Pro sera disponible prochainement. Restez à l'écoute !",
    });
  };
  
  const handleVoiceAnalysisComplete = (result: string) => {
    toast({
      title: "Analyse d'image complétée",
      description: result
    });
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <DiscussionsMenu />
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold text-lg hidden md:block">LuvviX</span>
          </Link>
          
          {/* Nouvelle section de raccourcis clavier */}
          <div className="hidden md:flex items-center ml-4">
            <KeyboardShortcuts />
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* Nouvelles fonctionnalités */}
          <VisionAnalysis onAnalysisComplete={handleVoiceAnalysisComplete} />
          
          <ShareOptions 
            content="Exemple de contenu à partager depuis LuvviX. Ceci est une démonstration des capacités de partage avancées."
          />
          
          <AdvancedVoiceSettings 
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
          
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border">
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuItem onClick={onOpenProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                {isPro ? (
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Pro - Gérer</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleProUpgrade}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Passer à Pro</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8">
                  <User className="h-4 w-4 mr-2" />
                  <span>Compte</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onOpenAuth("login")}>
                  Se connecter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenAuth("register")}>
                  S'inscrire
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
