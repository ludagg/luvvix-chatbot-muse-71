
import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export function OfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isFirstRender) {
        toast({
          title: "Connecté",
          description: "Vous êtes maintenant en ligne. Synchronisation en cours...",
          variant: "default",
        });
        
        // Synchroniser les données ici
        synchronizeData();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (!isFirstRender) {
        toast({
          title: "Déconnecté",
          description: "Vous êtes hors-ligne. Mode local activé.",
          variant: "default",
        });
      }
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Après le premier rendu, mettre isFirstRender à false
    setIsFirstRender(false);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isFirstRender]);
  
  // Simuler la synchronisation des données
  const synchronizeData = () => {
    // Récupérer les données locales qui doivent être synchronisées
    const pendingSync = localStorage.getItem("pendingSync");
    
    if (pendingSync) {
      // Simulation d'une synchronisation
      setTimeout(() => {
        console.log("Données synchronisées:", pendingSync);
        localStorage.removeItem("pendingSync");
        
        toast({
          title: "Synchronisation terminée",
          description: "Toutes les données ont été synchronisées avec succès.",
          variant: "default",
        });
      }, 1500);
    }
  };
  
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 inset-x-0 z-40 flex justify-center"
        >
          <div className="bg-muted px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <span>Mode hors-ligne activé</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook personnalisé pour détecter et gérer l'état de la connexion
export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Fonction pour sauvegarder les données en mode hors ligne
export const saveOfflineData = (key: string, data: any) => {
  try {
    // Sauvegarder les données dans le localStorage
    localStorage.setItem(key, JSON.stringify(data));
    
    // Si nous sommes hors ligne, ajouter à la file d'attente de synchronisation
    if (!navigator.onLine) {
      const pendingSyncRaw = localStorage.getItem("pendingSync") || "{}";
      const pendingSync = JSON.parse(pendingSyncRaw);
      
      pendingSync[key] = Date.now(); // Horodatage pour savoir quand cela a été mis en file d'attente
      
      localStorage.setItem("pendingSync", JSON.stringify(pendingSync));
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde hors ligne:", error);
    return false;
  }
};

// Fonction pour récupérer les données en mode hors ligne
export const getOfflineData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Erreur lors de la récupération hors ligne:", error);
    return null;
  }
};
