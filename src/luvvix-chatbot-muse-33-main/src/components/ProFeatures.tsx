
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProFeaturesProps {
  className?: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function ProFeatures({ className, children, side = 'top', align = 'center' }: ProFeaturesProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn("relative cursor-help", className)}>
          {children}
          <div className="absolute -right-1 -top-1">
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} className="w-80 p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Fonctionnalité PRO</h4>
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité est disponible uniquement avec un abonnement LuvviX PRO.
          </p>
          <Button size="sm" variant="default" className="w-full gap-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Passer à PRO
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default ProFeatures;
