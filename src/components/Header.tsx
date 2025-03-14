
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type HeaderProps = {
  onOpenAuth?: (mode: "login" | "register") => void;
};

export function Header({ onOpenAuth }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-r from-primary to-indigo-500">
            <span className="flex h-full w-full items-center justify-center font-bold text-white text-sm md:text-base">
              L
            </span>
          </span>
          <div className="font-bold text-lg md:text-xl">LuvviX AI</div>
        </div>

        <nav className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                      {user.displayName?.[0] || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="flex flex-col items-start gap-1">
                  <div className="font-medium">{user.displayName || user.email.split('@')[0]}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuItem>
                {user.age && (
                  <DropdownMenuItem disabled>
                    <span className="text-xs">Âge: {user.age} ans</span>
                  </DropdownMenuItem>
                )}
                {user.country && (
                  <DropdownMenuItem disabled>
                    <span className="text-xs">Pays: {user.country}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onOpenAuth?.("login")}>
                      Connexion
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenAuth?.("register")}>
                      S'inscrire
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => onOpenAuth?.("login")}>
                    Connexion
                  </Button>
                  <Button onClick={() => onOpenAuth?.("register")}>
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
