
import React from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface FloatingActionsProps {
  scrollToTop: () => void;
}

export function FloatingActions({ scrollToTop }: FloatingActionsProps) {
  const { user } = useAuth();
  
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
