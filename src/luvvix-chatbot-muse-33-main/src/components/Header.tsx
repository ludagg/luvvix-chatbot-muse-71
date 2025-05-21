
import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-lg px-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="ml-2 text-xl font-bold">LuvviX AI</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
