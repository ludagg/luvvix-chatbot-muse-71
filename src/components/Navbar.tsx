
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Bot, Cloud, Mail, FileText, Languages, Search, Code, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const products = [
    { name: "AI Studio", icon: Bot, route: "/ai-studio", description: "Créez des agents IA" },
    { name: "Cloud", icon: Cloud, route: "/cloud", description: "Stockage unifié" },
    { name: "Mail", icon: Mail, route: "/mail", description: "Messagerie intelligente" },
    { name: "Forms", icon: FileText, route: "/forms", description: "Formulaires avancés" },
    { name: "Translate", icon: Languages, route: "/translate", description: "Traduction IA" },
    { name: "Explore", icon: Search, route: "/explore", description: "Recherche intelligente" }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LuvviX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] grid-cols-2 gap-3 p-4">
                      {products.map((product) => (
                        <Link
                          key={product.name}
                          to={product.route}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <product.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              LuvviX {product.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {product.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/developers" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Code className="w-4 h-4" />
              <span>Développeurs</span>
            </Link>

            <Link to="/mail" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Mail className="w-4 h-4" />
              <span>Mail</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Connexion
                </Button>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Commencer
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white px-3">Produits</p>
                {products.map((product) => (
                  <Link
                    key={product.name}
                    to={product.route}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    onClick={() => setIsOpen(false)}
                  >
                    <product.icon className="w-4 h-4" />
                    <span>LuvviX {product.name}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <Link
                  to="/developers"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Code className="w-4 h-4" />
                  <span>Développeurs</span>
                </Link>
                <Link
                  to="/mail"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  onClick={() => setIsOpen(false)}
                >
                  <Mail className="w-4 h-4" />
                  <span>Mail</span>
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 px-3 space-y-2">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/auth')}>
                      Connexion
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => navigate('/auth')}>
                      Commencer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
