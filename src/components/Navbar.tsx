import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AccountSelector from './AccountSelector';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const ProductsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-white">
          Produits <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to="/ai-studio">LuvviX AI Studio</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/center">LuvviX Center</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cloud">LuvviX Cloud</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/forms">LuvviX Forms</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/translate">LuvviX Translate</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/code-studio">Code Studio</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/docs-generator">Docs Generator</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/crawler">Web Crawler</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/mind-map">Mind Map</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/learn">LuvviX Learn</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/analytics">Analytics</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/weather">Météo</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/news">Actualités</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DevelopersMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-white">
          Développeurs <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to="/ecosystem/api">API LuvviX</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/docs">Documentation</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/api-docs">API Docs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/luvvix-ai-integration">Intégrations IA</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || location.pathname !== '/' 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className={`font-bold text-xl ${
              isScrolled || location.pathname !== '/' ? 'text-gray-900' : 'text-white'
            }`}>
              LuvviX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/ecosystem">
              <Button 
                variant="ghost" 
                className={isScrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white hover:text-gray-200'}
              >
                Écosystème
              </Button>
            </Link>
            
            <div className={isScrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'}>
              <ProductsMenu />
            </div>
            
            <div className={isScrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'}>
              <DevelopersMenu />
            </div>
          </div>

          {/* User Menu / Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button 
                    variant="ghost"
                    className={isScrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white hover:text-gray-200'}
                  >
                    Dashboard
                  </Button>
                </Link>
                <AccountSelector />
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  className={`${
                    isScrolled || location.pathname !== '/' 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-white text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  Se connecter
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`md:hidden ${
                  isScrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
                }`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/ecosystem" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Écosystème
                  </Button>
                </Link>
                
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 px-3">Produits</p>
                  <Link to="/ai-studio" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">LuvviX AI Studio</Button>
                  </Link>
                  <Link to="/center" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">LuvviX Center</Button>
                  </Link>
                  <Link to="/cloud" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">LuvviX Cloud</Button>
                  </Link>
                  <Link to="/forms" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">LuvviX Forms</Button>
                  </Link>
                  <Link to="/translate" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">LuvviX Translate</Button>
                  </Link>
                  <Link to="/code-studio" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">Code Studio</Button>
                  </Link>
                  <Link to="/docs-generator" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">Docs Generator</Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 px-3">Développeurs</p>
                  <Link to="/ecosystem/api" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">API LuvviX</Button>
                  </Link>
                  <Link to="/docs" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">Documentation</Button>
                  </Link>
                  <Link to="/api-docs" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start pl-6">API Docs</Button>
                  </Link>
                </div>
                
                {user ? (
                  <div className="space-y-2 pt-4 border-t">
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                    </Link>
                    <AccountSelector />
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Se connecter
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
