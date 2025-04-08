
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, User, MessageSquareText, Globe, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { BatteryManager } from "@/components/BatteryManager";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span className="font-extrabold text-lg tracking-tight">LuvviX</span>
          <Badge variant="outline" className="hidden sm:inline-flex h-5 border-primary/50 text-xs">AI</Badge>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant={isActive('/') ? "default" : "ghost"} size="sm" className="gap-1">
              <MessageSquareText size={16} />
              <span>Chat</span>
            </Button>
          </Link>
          <Link to="/world">
            <Button variant={isActive('/world') ? "default" : "ghost"} size="sm" className="gap-1">
              <Globe size={16} />
              <span>World</span>
            </Button>
          </Link>
          <Link to="/enhanced">
            <Button variant={isActive('/enhanced') ? "default" : "ghost"} size="sm" className="gap-1">
              <Sparkles size={16} />
              <span>Enhanced</span>
            </Button>
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <BatteryManager className="hidden sm:flex" />
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <User size={20} />
          </Button>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    <span className="font-extrabold text-lg tracking-tight">LuvviX</span>
                    <Badge variant="outline" className="h-5 border-primary/50 text-xs">AI</Badge>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="h-auto p-1">
                    <X size={24} />
                  </Button>
                </div>
                
                <nav className="space-y-2 flex-1">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant={isActive('/') ? "default" : "ghost"} 
                      className="w-full justify-start gap-2"
                    >
                      <MessageSquareText size={18} />
                      <span>Chat</span>
                    </Button>
                  </Link>
                  
                  <Link to="/world" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant={isActive('/world') ? "default" : "ghost"} 
                      className="w-full justify-start gap-2"
                    >
                      <Globe size={18} />
                      <span>World</span>
                    </Button>
                  </Link>
                  
                  <Link to="/enhanced" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant={isActive('/enhanced') ? "default" : "ghost"} 
                      className="w-full justify-start gap-2"
                    >
                      <Sparkles size={18} />
                      <span>Enhanced</span>
                    </Button>
                  </Link>
                </nav>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <BatteryManager />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
