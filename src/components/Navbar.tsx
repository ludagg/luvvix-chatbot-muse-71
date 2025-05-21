
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, Bot, Cloud, FileText, User, ChevronDown, AppWindow, Newspaper, Radio, HeartPulse } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WeatherWidget from "@/components/weather/WeatherWidget";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center font-semibold">
            <span className="text-3xl font-bold bg-gradient-to-r from-luvvix-purple to-luvvix-teal inline-block text-transparent bg-clip-text">
              LuvviX
            </span>
          </Link>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                  )}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Produits
                </NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-xl p-4 min-w-[400px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Link to="/ai-studio" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                        <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX AI</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Créez vos propres agents IA</p>
                      </div>
                    </Link>
                    <Link to="/medecine" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <HeartPulse className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX Medic</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Solutions pour la santé numérique</p>
                      </div>
                    </Link>
                    <Link to="/streammix" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                        <Radio className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX StreamMix</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Streaming audio et vidéo</p>
                      </div>
                    </Link>
                    <Link to="/cloud" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX Cloud</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stockage sécurisé de fichiers</p>
                      </div>
                    </Link>
                    <Link to="/forms" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-full">
                        <FileText className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX Forms</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Formulaires intelligents</p>
                      </div>
                    </Link>
                    <Link to="/news" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                        <Newspaper className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">LuvviX News</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Actualités personnalisées</p>
                      </div>
                    </Link>
                    <Link to="/ecosystem" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors col-span-2 mt-2">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                        <AppWindow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Écosystème complet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Découvrez toutes nos applications et services</p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/ecosystem">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-primary/10 hover:text-primary",
                    isActive("/ecosystem") && "bg-primary/10 text-primary"
                  )}>
                    <AppWindow className="w-4 h-4 mr-2" />
                    Écosystème
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/news">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-primary/10 hover:text-primary",
                    isActive("/news") && "bg-primary/10 text-primary"
                  )}>
                    <Newspaper className="w-4 h-4 mr-2" />
                    Actualités
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
            <WeatherWidget />
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <AppWindow className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/ai-studio/dashboard")}>
                    <Bot className="mr-2 h-4 w-4" />
                    AI Studio
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {location.pathname !== "/auth" && (
                  <div className="flex items-center gap-2">
                    <Link to="/auth">
                      <Button variant="ghost" size="sm" className={cn(
                        isScrolled ? 'text-gray-700 dark:text-gray-200 hover:text-gray-900' : 'text-white dark:text-gray-200 hover:text-gray-100'
                      )}>
                        Se connecter
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true">
                      <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        S'inscrire
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className={cn(
                  "h-6 w-6",
                  isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                )} />
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="py-4">
                  {user && (
                    <div className="flex items-center gap-3 mb-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Avatar>
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user_metadata?.name || user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Applications</p>
                    
                    <Link to="/ai-studio" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span>LuvviX AI</span>
                    </Link>
                    
                    <Link to="/medecine" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <HeartPulse className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span>LuvviX Medic</span>
                    </Link>
                    
                    <Link to="/streammix" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Radio className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span>LuvviX StreamMix</span>
                    </Link>
                    
                    <Link to="/cloud" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>LuvviX Cloud</span>
                    </Link>
                    
                    <Link to="/forms" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      <span>LuvviX Forms</span>
                    </Link>
                    
                    <Link to="/news" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Newspaper className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span>LuvviX News</span>
                    </Link>
                    
                    <div className="border-t my-4"></div>
                    
                    <Link to="/ecosystem" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <AppWindow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Écosystème</span>
                    </Link>
                  </div>
                  
                  {!user && (
                    <div className="mt-6">
                      <div className="flex flex-col gap-2">
                        <Link to="/auth">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Se connecter
                          </Button>
                        </Link>
                        <Link to="/auth?signup=true">
                          <Button className="w-full justify-start">
                            S'inscrire
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
