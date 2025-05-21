
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";

interface LuvvixIdPromoProps {
  onGetStarted: () => void;
}

export const LuvvixIdPromo: React.FC<LuvvixIdPromoProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">LuvviX ID</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Utilisez un seul compte pour accéder à toutes les applications LuvviX.
      </p>
      
      <div className="mb-8 w-full max-w-md">
        <HoverGlowCard className="relative overflow-hidden rounded-xl border bg-background p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 h-16 w-16 rounded-full mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center">Un compte unifié</h3>
            <p className="text-sm text-muted-foreground text-center">
              Connectez-vous une seule fois pour accéder à LuvviX AI, LuvviX Santé, 
              et tous les autres services de l'écosystème LuvviX.
            </p>
          </div>
        </HoverGlowCard>
      </div>
      
      <Button 
        onClick={onGetStarted}
        size="lg"
        className="font-medium"
      >
        Commencer avec LuvviX ID
      </Button>
    </div>
  );
};

export default LuvvixIdPromo;
