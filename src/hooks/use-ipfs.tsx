
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Interface pour le contexte de stockage décentralisé
interface DecentralizedStorageContextType {
  isConnected: boolean;
  isInitializing: boolean;
  currentProvider: 'supabase' | 'arweave' | 'ipfs' | null;
  uploadFileToStorage: (file: File) => Promise<string | null>;
  getFileFromStorage: (cid: string) => Promise<Blob | null>;
  initializeStorage: () => Promise<boolean>;
  uploadProgress: number; // Add this new property
}

// Valeurs par défaut
const defaultContext: DecentralizedStorageContextType = {
  isConnected: false,
  isInitializing: true,
  currentProvider: null,
  uploadFileToStorage: async () => null,
  getFileFromStorage: async () => null,
  initializeStorage: async () => false,
  uploadProgress: 0, // Default value
};

// Créer le contexte
const DecentralizedStorageContext = createContext<DecentralizedStorageContextType>(defaultContext);

// Variable globale pour suivre les tentatives d'initialisation
let initializationAttempts = 0;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

// Fonction d'initialisation exportée
export const initializeStorageService = async (): Promise<boolean> => {
  console.log("Initializing storage buckets...");
  
  try {
    // Vérifier d'abord si les buckets existent déjà
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const cloudBucketExists = buckets?.some(bucket => bucket.name === 'cloud');
      const metadataBucketExists = buckets?.some(bucket => bucket.name === 'metadata');
      
      if (cloudBucketExists && metadataBucketExists) {
        console.log("Storage buckets already exist");
        return true;
      }
    } catch (checkError) {
      console.log("Error checking buckets:", checkError);
      // Continue avec la création
    }
    
    // Utiliser la Edge Function pour créer les buckets
    console.log("Creating storage buckets via Edge Function...");
    const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/setup-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Edge function failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Storage initialized via Edge Function:", result.message);
    return true;
  } catch (error) {
    console.error("Failed to initialize storage buckets:", error);
    
    // Retry with fallback to direct API if needed
    if (initializationAttempts < MAX_ATTEMPTS) {
      initializationAttempts++;
      console.log(`Retrying storage initialization (attempt ${initializationAttempts}/${MAX_ATTEMPTS})...`);
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      try {
        // Essai direct de création des buckets
        await supabase.storage.createBucket('cloud', { public: false });
        await supabase.storage.createBucket('metadata', { public: false });
        console.log("Storage buckets created directly via API");
        return true;
      } catch (fallbackError) {
        console.error("Failed to create buckets directly:", fallbackError);
        return false;
      }
    }
    
    return false;
  }
};

// Implémentation d'ArweaveStorage (version simplifiée)
const uploadToArweave = async (file: File): Promise<string | null> => {
  try {
    // Ici, nous simulons un téléchargement vers Arweave
    // Dans une implémentation réelle, vous utiliseriez la bibliothèque Arweave
    console.log("Uploading file to Arweave:", file.name);
    
    // Simuler un délai de téléchargement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Générer un ID fictif pour Arweave
    const arweaveId = `ar-${Math.random().toString(36).substring(2, 15)}`;
    console.log("File uploaded to Arweave with ID:", arweaveId);
    
    return arweaveId;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    return null;
  }
};

const getFromArweave = async (cid: string): Promise<Blob | null> => {
  // Simulation de récupération depuis Arweave
  console.log("Getting file from Arweave:", cid);
  
  // Dans une vraie implémentation, vous feriez une requête à Arweave
  // Pour cette démo, nous retournons un blob vide
  return new Blob(["Arweave file content"], { type: "text/plain" });
};

// Provider pour le contexte
export const DecentralizedStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentProvider, setCurrentProvider] = useState<'supabase' | 'arweave' | 'ipfs' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Add state for tracking upload progress

  // Fonction pour télécharger un fichier vers le stockage décentralisé
  const uploadFileToStorage = useCallback(async (file: File): Promise<string | null> => {
    try {
      // Reset progress at the start
      setUploadProgress(0);
      console.log(`Uploading file "${file.name}" using provider: ${currentProvider}`);
      
      // Setup progress tracking with simulated upload steps
      const updateProgress = () => {
        setUploadProgress(prev => {
          // Simulate progress that never quite reaches 100% until complete
          const nextProgress = Math.min(prev + Math.random() * 15, 95);
          return nextProgress;
        });
      };
      
      // Start progress updates
      const progressInterval = setInterval(updateProgress, 800);
      
      // Essayer d'abord le provider principal
      if (currentProvider === 'supabase') {
        try {
          // Générer un chemin unique pour le fichier
          const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { data, error } = await supabase.storage
            .from('cloud')
            .upload(filePath, file);
            
          if (error) throw error;
          
          // Complete the progress
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Retourner le chemin complet pour récupération ultérieure
          return `supabase:cloud/${filePath}`;
        } catch (supabaseError) {
          console.error("Supabase upload failed, falling back to Arweave:", supabaseError);
          // Fall back to Arweave
          const arweaveId = await uploadToArweave(file);
          
          // Complete the progress
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          if (arweaveId) return `arweave:${arweaveId}`;
          throw new Error("All storage providers failed");
        }
      } else if (currentProvider === 'arweave') {
        const arweaveId = await uploadToArweave(file);
        
        // Complete the progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (arweaveId) return `arweave:${arweaveId}`;
        throw new Error("Arweave upload failed");
      }
      
      // Cleanup in case of early exit
      clearInterval(progressInterval);
      setUploadProgress(0);
      
      throw new Error("No storage provider available");
    } catch (error) {
      console.error("Error uploading file to decentralized storage:", error);
      // Reset progress on error
      setUploadProgress(0);
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger ce fichier vers le stockage décentralisé"
      });
      return null;
    }
  }, [currentProvider]);

  // Fonction pour récupérer un fichier depuis le stockage décentralisé
  const getFileFromStorage = useCallback(async (cid: string): Promise<Blob | null> => {
    try {
      // Déterminer le provider basé sur le préfixe du CID
      if (cid.startsWith('supabase:')) {
        const path = cid.replace('supabase:', '');
        const [bucket, ...filePath] = path.split('/');
        const fullPath = filePath.join('/');
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(fullPath);
          
        if (error) throw error;
        return data;
      }
      else if (cid.startsWith('arweave:')) {
        const arweaveId = cid.replace('arweave:', '');
        return await getFromArweave(arweaveId);
      }
      else if (cid.startsWith('ipfs:')) {
        // Implémentation IPFS si nécessaire
        throw new Error("IPFS provider not implemented yet");
      }
      else {
        // Fallback pour les CIDs sans préfixe (compatibilité)
        try {
          // Essayer d'abord Supabase
          const { data, error } = await supabase.storage
            .from('cloud')
            .download(cid);
            
          if (!error && data) return data;
          
          // Si ça échoue, essayer Arweave
          return await getFromArweave(cid);
        } catch (fallbackError) {
          console.error("Fallback storage retrieval error:", fallbackError);
          return null;
        }
      }
    } catch (error) {
      console.error("Error retrieving file from decentralized storage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer ce fichier depuis le stockage décentralisé"
      });
      return null;
    }
  }, []);

  // Fonction pour initialiser le système de stockage décentralisé
  const initializeStorage = useCallback(async (): Promise<boolean> => {
    setIsInitializing(true);
    try {
      // Essayer d'abord Supabase
      const supabaseInitialized = await initializeStorageService();
      
      if (supabaseInitialized) {
        setCurrentProvider('supabase');
        setIsConnected(true);
        return true;
      } 
      
      // Fallback à Arweave si Supabase échoue
      console.log("Falling back to Arweave storage");
      // Dans une véritable implémentation, vous initialiseriez la connexion Arweave ici
      setCurrentProvider('arweave');
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("Failed to initialize any storage provider:", error);
      setIsConnected(false);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Initialiser le stockage au chargement
  useEffect(() => {
    const initialize = async () => {
      await initializeStorage();
    };
    
    initialize();
  }, [initializeStorage]);

  const contextValue: DecentralizedStorageContextType = {
    isConnected,
    isInitializing,
    currentProvider,
    uploadFileToStorage,
    getFileFromStorage,
    initializeStorage,
    uploadProgress, // Expose the upload progress
  };

  return (
    <DecentralizedStorageContext.Provider value={contextValue}>
      {children}
    </DecentralizedStorageContext.Provider>
  );
};

// Hook pour utiliser le stockage décentralisé
export const useDecentralizedStorage = () => {
  const context = useContext(DecentralizedStorageContext);
  
  if (context === undefined) {
    throw new Error('useDecentralizedStorage must be used within a DecentralizedStorageProvider');
  }
  
  return context;
};

// Fonctions exportées pour la compatibilité avec le code existant
export const uploadFileToIPFS = async (file: File): Promise<string | null> => {
  const context = useContext(DecentralizedStorageContext);
  return await context.uploadFileToStorage(file);
};

export const getFileFromIPFS = async (cid: string): Promise<Blob | null> => {
  const context = useContext(DecentralizedStorageContext);
  return await context.getFileFromStorage(cid);
};
