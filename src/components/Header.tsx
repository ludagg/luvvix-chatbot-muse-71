
import { useState } from "react";
import { useCrossAuth } from "@/contexts/CrossAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { LogOut, Settings, User, Globe, Search, Menu, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ConversationSelector } from "@/components/ConversationSelector";
import { DiscussionsMenu } from "@/components/DiscussionsMenu";
import { ProBadge } from "@/components/ProBadge";
import { Dispatch, SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onOpenAuth: (mode: "login" | "register") => void;
  onOpenProfile: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({ onOpenAuth, onOpenProfile, isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  // Try CrossAuth first, then fallback to standard Auth
  const crossAuth = useCrossAuth();
  const standardAuth = useAuth();
  
  // Use CrossAuth if available, otherwise use standard Auth
  const { user, isPro = false, isLoading } = crossAuth || standardAuth;
  
  // Get logout function that fits regardless of auth system used
  const logout = crossAuth?.logout || standardAuth?.logout;
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const isWorldPage = location.pathname === "/world";
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleWebSearchClick = () => {
    // Open a new tab with a search engine (using Bing for its API integration possibilities)
    window.open("https://www.bing.com", "_blank");
  };

  const displayName = user?.full_name || user?.displayName || "User";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-md border-b border-border/30 py-3"
    >
      <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 h-full">
                <ConversationSelector closeMenu={() => setIsSidebarOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold tracking-tight text-gradient">
            LuvviX
          </span>
          {isPro ? (
            <ProBadge className="ml-0" />
          ) : (
            <span className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
              Beta
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* World button - visible on desktop */}
          {!isMobile && (
            <Button
              variant={isWorldPage ? "default" : "outline"}
              size="sm"
              asChild
              className={`gap-1 text-xs h-8 ${isWorldPage ? '' : 'border-primary/30 hover:bg-primary/10'} hidden md:flex`}
            >
              <Link to={isWorldPage ? "/" : "/world"}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isWorldPage ? "Chat" : "World"}</span>
              </Link>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleWebSearchClick}
            className="gap-1 text-xs h-8 border-primary/30 hover:bg-primary/10 hidden md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Recherche</span>
          </Button>
          <DiscussionsMenu />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full h-8 w-8 bg-primary/10"
                >
                  <Avatar className="h-8 w-8 select-none">
                    <AvatarFallback className="bg-primary/20 text-foreground text-xs">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{displayName}</span>
                      {isPro && <ProBadge size="sm" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-center" onClick={onOpenProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                {/* World button - For mobile only */}
                {isMobile && (
                  <DropdownMenuItem asChild className="cursor-pointer flex items-center">
                    <Link to={isWorldPage ? "/" : "/world"}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>{isWorldPage ? "Chat" : "World"}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={handleWebSearchClick}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Recherche web</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenAuth("login")}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Chargement...</span>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Se connecter avec LuvviX ID
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
