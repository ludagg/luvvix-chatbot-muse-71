import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/hooks/useLanguage";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, Bot, Cloud, FileText, User, AppWindow, Newspaper, Network, Languages, Code, Search, Mail, Zap, Shield, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainApps = [
    {
      id: 'cloud',
      name: 'LuvviX Cloud',
      description: 'Unifiez tous vos services cloud',
      icon: Cloud,
      href: '/cloud',
      gradient: 'from-blue-500 to-cyan-500',
      badge: 'Nouveau'
    },
    {
      id: 'mail',
      name: 'LuvviX Mail',
      description: 'Interface email moderne et unifiée',
      icon: Mail,
      href: '/mail',
      gradient: 'from-purple-500 to-pink-500',
      badge: 'Populaire'
    },
    {
      id: 'explore',
      name: 'LuvviX Explore',
      description: 'Recherche IA multimodale avancée',
      icon: Search,
      href: '/explore',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'ai-studio',
      name: 'AI Studio',
      description: 'Créez vos agents IA personnalisés',
      icon: Bot,
      href: '/ai-studio',
      gradient: 'from-violet-500 to-purple-500',
      badge: 'IA'
    }
  ];

  const productivityApps = [
    {
      id: 'translate',
      name: 'LuvviX Translate',
      description: 'Traduction intelligente temps réel',
      icon: Languages,
      href: '/translate',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'mindmap',
      name: 'MindMap',
      description: 'Cartes mentales collaboratives',
      icon: Network,
      href: '/mindmap',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'code-studio',
      name: 'Code Studio',
      description: 'Développement assisté par IA',
      icon: Code,
      href: '/code-studio',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'forms',
      name: 'LuvviX Forms',
      description: 'Formulaires intelligents',
      icon: FileText,
      href: '/forms',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo ultra-premium */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 inline-block text-transparent bg-clip-text">
                LuvviX
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                Digital Ecosystem
              </div>
            </div>
          </Link>

          {/* Navigation principale - version desktop */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "bg-transparent hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-base font-medium px-6 py-3 h-auto rounded-xl transition-all duration-300",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                  )}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Applications
                </NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-2xl p-6 min-w-[800px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        Applications Principales
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {mainApps.map((app) => (
                          <Link key={app.id} to={app.href} className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${app.gradient} text-white shadow-lg`}>
                                  <app.icon className="w-6 h-6" />
                                </div>
                                {app.badge && (
                                  <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                                    {app.badge}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{app.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-500" />
                        Outils de Productivité
                      </h3>
                      <div className="grid gap-3 md:grid-cols-4">
                        {productivityApps.map((app) => (
                          <Link key={app.id} to={app.href} className="group p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                              <app.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{app.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{app.description}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/ecosystem">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-12 items-center justify-center rounded-xl px-6 py-3 text-base font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                    isActive("/ecosystem") && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}>
                    <AppWindow className="w-4 h-4 mr-2" />
                    Écosystème
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/news">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-12 items-center justify-center rounded-xl px-6 py-3 text-base font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                    isActive("/news") && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}>
                    <Newspaper className="w-4 h-4 mr-2" />
                    Actualités
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions à droite */}
          <div className="flex items-center gap-4">
            <WeatherWidget />
            
            <ThemeToggle />
                        
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 h-12 w-12 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
                  <div className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-gray-900 dark:text-white">
                        {user.user_metadata?.name || user.email}
                      </p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                      <Badge variant="outline" className="text-xs w-fit bg-green-50 text-green-700 border-green-200">
                        Premium
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-lg p-3">
                    <AppWindow className="mr-3 h-4 w-4" />
                    Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cloud")} className="rounded-lg p-3">
                    <Cloud className="mr-3 h-4 w-4" />
                    LuvviX Cloud
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/mail")} className="rounded-lg p-3">
                    <Mail className="mr-3 h-4 w-4" />
                    LuvviX Mail
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-lg p-3 text-red-600 dark:text-red-400">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {location.pathname !== "/auth" && (
                  <div className="flex items-center gap-3">
                    <Link to="/auth">
                      <Button variant="ghost" size="sm" className={cn(
                        "rounded-xl px-6 py-3 font-medium transition-all duration-300",
                        isScrolled ? 'text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white dark:text-gray-200 hover:text-gray-100 hover:bg-white/10'
                      )}>
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-300 hover:shadow-xl">
                        Commencer
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Menu mobile */}
            <Sheet>
              <SheetTrigger className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className={cn(
                    "h-6 w-6",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                  )} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 pt-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
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
                    <p className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Applications Principales</p>
                    
                    <Link to="/cloud" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>LuvviX Cloud</span>
                    </Link>
                    
                    <Link to="/mail" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span>LuvviX Mail</span>
                    </Link>
                    
                    <Link to="/explore" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span>LuvviX Explore</span>
                    </Link>
                    
                    <Link to="/ai-studio" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span>{t.aiStudio.title}</span>
                    </Link>
                    
                    <div className="border-t my-4"></div>
                    <p className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Autres Applications</p>
                    
                    <Link to="/translate" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Languages className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>LuvviX Translate</span>
                    </Link>
                    
                    <Link to="/mindmap" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span>LuvviX MindMap</span>
                    </Link>
                    
                    <Link to="/code-studio" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span>Code Studio</span>
                    </Link>
                    
                    <Link to="/forms" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      <span>{t.forms.title}</span>
                    </Link>
                    
                    <Link to="/news" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Newspaper className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span>{t.news.title}</span>
                    </Link>
                    
                    <div className="border-t my-4"></div>
                    
                    <Link to="/ecosystem" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <AppWindow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Écosystème complet</span>
                    </Link>
                  </div>
                  
                  {!user && (
                    <div className="mt-6">
                      <div className="flex flex-col gap-2">
                        <Link to="/auth">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            {t.nav.login}
                          </Button>
                        </Link>
                        <Link to="/auth?signup=true">
                          <Button className="w-full justify-start">
                            Créer un compte
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
