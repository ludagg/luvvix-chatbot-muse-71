
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, User, ArrowRight } from "lucide-react";
import { HoverGlowCard } from '@/components/ui/hover-glow-card';
import { useAuth } from '@/hooks/useAuth';

const LuvvixIdPromo = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Si l'utilisateur est connecté, on masque la promotion
    if (user) {
      setVisible(false);
    }
  }, [user]);

  if (!visible) return null;

  return (
    <section className="py-10 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <div className="container mx-auto px-4">
        <HoverGlowCard className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg p-6 md:p-8" glowColor="rgba(138, 135, 245, 0.3)">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
              <Shield className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-center md:text-left">
                Créez votre compte LuvviX ID
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center md:text-left">
                Un seul compte pour accéder à tous les services de l'écosystème LuvviX.
                Simplifiez votre expérience numérique dès aujourd'hui !
              </p>
            </div>
            
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <User className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                  Créer un compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </HoverGlowCard>
      </div>
    </section>
  );
};

export default LuvvixIdPromo;
