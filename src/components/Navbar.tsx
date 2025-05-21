import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Bot } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut, globalSignOut } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
          LuvviX
        </Link>

        <ul className="hidden md:flex items-center space-x-4">
          <li>
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              Accueil
            </Link>
          </li>
          <li>
            <Link
              to="/ecosystem"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              Écosystème
            </Link>
          </li>
          <li>
            <Link
              to="/api-docs"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              API
            </Link>
          </li>
          <li>
            <Link
              to="/docs"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              Docs
            </Link>
          </li>
          <li>
            <Link 
              to="/ai" 
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              Luvvix AI
            </Link>
          </li>
        </ul>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
          >
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || user.email || "Avatar"} />
                    <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {profile?.full_name || user.email}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/dashboard" className="w-full h-full block">
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Se déconnecter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => globalSignOut()}>
                  Déconnexion globale
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button>Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
