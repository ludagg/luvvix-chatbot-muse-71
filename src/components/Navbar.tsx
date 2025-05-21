
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  User, 
  Newspaper, 
  Bot, 
  Sparkles, 
  FileText, 
  Search, 
  Cloud, 
  Shield, 
  Settings, 
  Bell, 
  Grid,
  ChevronDown
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import WeatherWidget from './weather/WeatherWidget';
import NewsNotification from './news/NewsNotification';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { theme } = useTheme();

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
      ? 'bg-white/90 dark:bg-[#1A1F2C]/90 backdrop-blur-md shadow-lg py-3' 
      : 'bg-transparent py-5'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">LuvviX</span>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'}>
                      Produits
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link to="/ai-studio" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-500 to-purple-700 p-6 no-underline outline-none focus:shadow-md">
                              <Bot className="h-6 w-6 text-white" />
                              <div className="mt-4 mb-2 text-lg font-medium text-white">
                                AI Studio <Sparkles className="inline-block h-4 w-4 text-yellow-300" />
                              </div>
                              <p className="text-sm leading-tight text-white/90">
                                Créez vos propres agents IA pour automatiser vos tâches
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/forms" title="Forms" icon={<FileText className="h-4 w-4 mr-2" />}>
                          Créez et partagez des formulaires intelligents
                        </ListItem>
                        <ListItem href="/news" title="News" icon={<Newspaper className="h-4 w-4 mr-2" />}>
                          Restez informé avec des actualités personnalisées
                        </ListItem>
                        <ListItem href="/cloud" title="Cloud" icon={<Cloud className="h-4 w-4 mr-2" />}>
                          Stockez et partagez vos fichiers en toute sécurité
                        </ListItem>
                        <ListItem href="/weather" title="Météo" icon={<Cloud className="h-4 w-4 mr-2" />}>
                          Consultez les prévisions météorologiques
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'}>
                      Ressources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 w-[200px]">
                        <ListItem href="/docs" title="Documentation" icon={<FileText className="h-4 w-4 mr-2" />} />
                        <ListItem href="/api-docs" title="API" icon={<FileText className="h-4 w-4 mr-2" />} />
                        <ListItem href="/help" title="Centre d'aide" icon={<FileText className="h-4 w-4 mr-2" />} />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/pricing" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                        "hover:bg-accent hover:text-accent-foreground"
                      )}>
                        Tarifs
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Weather Widget */}
            <WeatherWidget />
            
            {/* News Notifications */}
            <NewsNotification />
            
            {/* Search Button */}
            <button 
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white/80 hover:text-white'
              } transition-colors`}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white hover:bg-white/10'}>
                      <Grid className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard?tab=profile">
                    <Button variant="ghost" size="icon" className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white hover:bg-white/10'}>
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white hover:bg-white/10'}>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Créer un compte
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Add WeatherWidget in mobile view before the menu button */}
            <WeatherWidget />
            <div className="ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 animate-fade-in bg-white dark:bg-[#1A1F2C] mt-4 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 p-4">
              <div className="border-b pb-2 mb-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Produits</h3>
                <div className="space-y-3 pl-2">
                  <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-600 dark:text-indigo-400">
                    <Bot className="w-4 h-4 mr-1" />
                    AI Studio
                    <Sparkles className="w-3 h-3 ml-1 text-yellow-500" />
                  </Link>
                  <Link to="/forms" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Forms
                  </Link>
                  <Link to="/news" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <Newspaper className="w-4 h-4 mr-1" />
                    News
                  </Link>
                  <Link to="/cloud" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <Cloud className="w-4 h-4 mr-1" />
                    Cloud
                  </Link>
                  <Link to="/weather" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <Cloud className="w-4 h-4 mr-1" />
                    Météo
                  </Link>
                </div>
              </div>
              
              <div className="border-b pb-2 mb-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Ressources</h3>
                <div className="space-y-3 pl-2">
                  <Link to="/docs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Documentation
                  </Link>
                  <Link to="/api-docs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    API
                  </Link>
                  <Link to="/help" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Centre d'aide
                  </Link>
                </div>
              </div>
              
              <div className="border-b pb-2 mb-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Légal</h3>
                <div className="space-y-3 pl-2">
                  <Link to="/privacy" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Confidentialité
                  </Link>
                  <Link to="/terms" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    CGU
                  </Link>
                  <Link to="/cookies" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Cookies
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <NewsNotification />
              </div>
              
              {!loading && (
                user ? (
                  <div className="space-y-2 pt-2">
                    <Link to="/dashboard">
                      <Button variant="outline" className="justify-center w-full">
                        <Grid className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/dashboard?tab=profile">
                      <Button variant="outline" className="justify-center w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link to="/auth">
                      <Button variant="outline" className="justify-center w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white justify-center w-full">
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

const ListItem = ({ 
  href, 
  title, 
  children, 
  icon 
}: { 
  href: string; 
  title: string; 
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          {children && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>}
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export default Navbar;
