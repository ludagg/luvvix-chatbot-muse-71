
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, X, User, Newspaper, Bot, Sparkles, FileText, Search, 
  Cloud, Shield, Grid, BellRing, Clock, ChevronDown, LogIn, UserPlus
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import WeatherWidget from './weather/WeatherWidget';
import NewsNotification from './news/NewsNotification';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? 'bg-[#1A1F2C] shadow-lg py-4' 
      : 'bg-transparent py-6'
  }`;

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-8">
              <span className="text-2xl font-bold text-white">LuvviX</span>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-white/80 hover:text-white bg-transparent hover:bg-white/10">Écosystème</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500 to-indigo-700 p-6 no-underline outline-none focus:shadow-md"
                              to="/ecosystem"
                            >
                              <Grid className="h-6 w-6 text-white" />
                              <div className="mt-4 mb-2 text-lg font-medium text-white">
                                Écosystème LuvviX
                              </div>
                              <p className="text-sm leading-tight text-white/90">
                                Découvrez notre suite complète d'applications et services qui révolutionnent l'expérience digitale.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <Link to="/ai-studio" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-purple-500" />
                              <div className="text-sm font-medium leading-none">AI Studio</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
                              Créez vos propres agents conversationnels
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link to="/forms" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-500" />
                              <div className="text-sm font-medium leading-none">Forms</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
                              Créez et gérez des formulaires professionnels
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link to="/cloud" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <Cloud className="h-4 w-4 text-sky-500" />
                              <div className="text-sm font-medium leading-none">Cloud</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
                              Stockage et partage de fichiers sécurisé
                            </p>
                          </Link>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link to="/ai-studio" className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground h-10 px-4 py-2",
                      "text-indigo-300 hover:text-indigo-200 hover:bg-white/10 rounded-md"
                    )}>
                      <Bot className="w-4 h-4 mr-2" />
                      AI Studio
                      <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link to="/news" className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground h-10 px-4 py-2",
                      "text-white/80 hover:text-white hover:bg-white/10 rounded-md"
                    )}>
                      <Newspaper className="w-4 h-4 mr-2" />
                      News
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-white/80 hover:text-white bg-transparent hover:bg-white/10">Plus</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-2 p-4">
                        <li>
                          <Link to="/cloud" className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <Cloud className="h-4 w-4" />
                              <span>Cloud</span>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/docs" className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Documentation</span>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/weather" className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <Cloud className="h-4 w-4" />
                              <span>Météo</span>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/privacy" className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>Confidentialité</span>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Desktop Menu - Right side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Current Time */}
            <div className="text-white/80 px-2 py-1 rounded-md bg-white/5 text-sm font-mono">
              <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              {formattedTime}
            </div>
            
            {/* Weather Widget */}
            <WeatherWidget />
            
            {/* News Notifications */}
            <NewsNotification />
            
            {/* Search Button */}
            <button 
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            
            {!loading && (
              user ? (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <LogIn className="w-4 h-4 mr-2" />
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button size="sm" className="bg-white text-luvvix-purple hover:bg-white/90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Créer un compte
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Current Time - Mobile */}
            <div className="text-white/80 px-2 py-1 rounded-md bg-white/5 text-sm font-mono mr-2">
              <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              {formattedTime}
            </div>
            
            {/* Weather Widget in mobile view */}
            <WeatherWidget />
            
            <div className="ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 animate-fade-in bg-[#1A1F2C] mt-4 rounded-lg">
            <div className="flex flex-col space-y-4 p-4">
              <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                Accueil
              </Link>
              
              <Link to="/ecosystem" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Grid className="w-4 h-4 mr-1" />
                Écosystème
              </Link>
              
              <Link to="/forms" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <FileText className="w-4 h-4 mr-1" />
                Forms
              </Link>
              
              <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-300 hover:text-indigo-200 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <Bot className="w-4 h-4 mr-1" />
                AI Studio
                <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
              </Link>
              
              <Link to="/news" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Link>
              
              <Link to="/cloud" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Cloud className="w-4 h-4 mr-1" />
                Cloud
              </Link>
              
              <Link to="/weather" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Cloud className="w-4 h-4 mr-1" />
                Météo
              </Link>
              
              <Link to="/docs" className="text-sm font-medium text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Documentation
              </Link>
              
              <Link to="/privacy" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Shield className="w-4 h-4 mr-1" />
                Confidentialité
              </Link>
              
              <Link to="/terms" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <FileText className="w-4 h-4 mr-1" />
                CGU
              </Link>
              
              <div className="flex items-center space-x-4">
                <NewsNotification />
              </div>
              
              {!loading && (
                user ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="text-white hover:bg-white/10 justify-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="text-white hover:bg-white/10 justify-center w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="bg-white text-luvvix-purple hover:bg-white/90 justify-center w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Créer un compte
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
