
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export const Header = ({ onOpenAuth }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
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

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-md border-b border-border/30 py-3"
    >
      <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold tracking-tight text-gradient">
            LuvviX AI
          </span>
          <span className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
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
                      {getInitials(user.displayName || "User")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-foreground text-xs">
                      {getInitials(user.displayName || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">
                      {user.displayName || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon profil</span>
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
            >
              <User className="h-4 w-4" />
              Connexion
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
