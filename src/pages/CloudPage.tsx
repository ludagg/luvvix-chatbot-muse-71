import { useEffect, useState } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudSidebar from "@/components/cloud/CloudSidebar";
import FileExplorer from "@/components/cloud/FileExplorer";
import CloudHeader from "@/components/cloud/CloudHeader";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { dbService } from "@/services/db-service";
import { fileService } from "@/services/file-service";
import { supabase } from "@/integrations/supabase/client";
import { DecentralizedStorageProvider, useDecentralizedStorage, initializeStorageService } from "@/hooks/use-ipfs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const CloudContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{
    totalFiles: number;
    usedStorage: number;
    syncing: boolean;
  }>({
    totalFiles: 0,
    usedStorage: 0,
    syncing: false,
  });
  const { folderId, fileId } = useParams();
  const { isConnected, isInitializing } = useDecentralizedStorage();
  const [storageError, setStorageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initProgress, setInitProgress] = useState(0);
  
  // Initialize IndexedDB
  useEffect(() => {
    const initDb = async () => {
      try {
        const result = await dbService.initialize();
        setDbInitialized(result);
        if (result) {
          console.log("IndexedDB initialized successfully");
        } else {
          toast({
            title: "Database Error",
            description: "Could not initialize local database. Some features may not work properly.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        toast({
          title: "Database Error",
          description: "Failed to initialize local database. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      initDb();
    }
  }, [user, toast]);
  
  // Initialize storage bucket and sync files with exponential backoff and progress updates
  useEffect(() => {
    let mounted = true;
    const setupStorage = async () => {
      if (user && dbInitialized && mounted) {
        try {
          if (isConnected) {
            // Start syncing files with progress updates
            setCloudStatus(prev => ({ ...prev, syncing: true }));
            
            // Show initialization progress
            const progressInterval = setInterval(() => {
              if (mounted) {
                setInitProgress(prev => {
                  const newValue = Math.min(prev + 5, 90);
                  return newValue;
                });
              }
            }, 500);
            
            await fileService.syncFilesFromSupabase();
            await updateCloudStats();
            
            clearInterval(progressInterval);
            setInitProgress(100);
            
            setTimeout(() => {
              if (mounted) {
                setCloudStatus(prev => ({ ...prev, syncing: false }));
                setStorageError(null);
              }
            }, 500);
            
            toast({
              title: "Synchronisation terminée",
              description: "Vos fichiers sont à jour",
            });
          } else {
            if (retryCount < 3) {
              await initializeStorageService();
              setRetryCount(prev => prev + 1);
            } else if (!isInitializing) {
              setStorageError("Le stockage décentralisé n'est pas disponible. Veuillez réessayer plus tard.");
            }
          }
        } catch (error) {
          console.error("Error syncing with cloud:", error);
          if (mounted) {
            setCloudStatus(prev => ({ ...prev, syncing: false }));
            setStorageError("Impossible de synchroniser vos fichiers avec le cloud.");
            
            toast({
              variant: "destructive",
              title: "Erreur de synchronisation",
              description: "Impossible de synchroniser vos fichiers. Veuillez réessayer.",
            });
          }
        }
      }
    };
    
    if (dbInitialized) {
      setupStorage();
    }
    
    return () => {
      mounted = false;
    };
  }, [user, dbInitialized, toast, isConnected, retryCount, isInitializing]);
  
  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Set up real-time changes from Supabase
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('cloud_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cloud_files'
        },
        async (payload) => {
          console.log('Cloud files changed:', payload);
          // Sync the changed files
          await fileService.syncFilesFromSupabase();
          updateCloudStats();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateCloudStats = async () => {
    try {
      const files = await dbService.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      setCloudStatus({
        totalFiles: files.length,
        usedStorage: totalSize,
        syncing: false,
      });
      
      return true;
    } catch (error) {
      console.error("Error updating cloud stats:", error);
      return false;
    }
  };

  // Helper function to handle Import/Export
  const handleExportCloud = async () => {
    try {
      const exportData = await fileService.exportFiles();
      
      // Create download link
      const url = URL.createObjectURL(exportData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvvix-cloud-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: "Vos fichiers ont été exportés avec succès",
      });
    } catch (error) {
      console.error("Error exporting cloud:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter vos fichiers",
      });
    }
  };

  // Function to retry connecting to storage
  const retryStorageConnection = async () => {
    try {
      setStorageError("Tentative de reconnexion au stockage...");
      setInitProgress(0);
      
      // Show progress during the retry
      const progressInterval = setInterval(() => {
        setInitProgress(prev => {
          const newValue = Math.min(prev + 10, 90);
          return newValue;
        });
      }, 800);
      
      // Call the initialization function from the storage hook
      await initializeStorageService();
      
      clearInterval(progressInterval);
      setInitProgress(100);
      
      // Sync files
      setCloudStatus(prev => ({ ...prev, syncing: true }));
      await fileService.syncFilesFromSupabase();
      await updateCloudStats();
      setCloudStatus(prev => ({ ...prev, syncing: false }));
      setStorageError(null);
      
      toast({
        title: "Stockage initialisé",
        description: "L'espace de stockage est maintenant disponible",
      });
    } catch (error) {
      console.error("Error retrying storage connection:", error);
      setInitProgress(0);
      setStorageError("Impossible de se connecter à l'espace de stockage. Vérifiez votre connexion ou réessayez plus tard.");
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter à l'espace de stockage",
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="p-6 max-w-md mx-auto mt-16">
        <Alert className="mb-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <AlertTitle>Initialisation du stockage</AlertTitle>
          <AlertDescription>
            Veuillez patienter pendant l'initialisation de votre espace de stockage décentralisé...
          </AlertDescription>
        </Alert>
        
        <Progress 
          value={initProgress} 
          className="mb-4" 
          showPercentage
        />
      </div>
    );
  }

  if (storageError) {
    return (
      <div className="p-6 max-w-md mx-auto mt-16">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Stockage non disponible</AlertTitle>
          <AlertDescription>
            {storageError}
          </AlertDescription>
        </Alert>
        
        {initProgress > 0 && (
          <Progress 
            value={initProgress} 
            className="mb-4"
            status={initProgress === 100 ? "success" : "warning"}
            showPercentage
          />
        )}
        
        <Button 
          onClick={retryStorageConnection}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${initProgress > 0 && initProgress < 100 ? "animate-spin" : ""}`} />
          Réessayer la connexion
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 h-16 shadow-sm bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Navbar />
      </div>
      
      <div className="flex-grow flex mt-16">
        {sidebarOpen && (
          <div className={`${isMobile ? 'fixed inset-y-16 left-0 z-30' : 'w-64 border-r'} bg-white dark:bg-gray-900 shadow-lg`}>
            <CloudSidebar 
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
              cloudStatus={cloudStatus}
              onExportCloud={handleExportCloud}
            />
            {isMobile && (
              <div 
                className="fixed inset-0 mt-16 bg-black/50 z-20" 
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <CloudHeader 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            sidebarOpen={sidebarOpen}
          />
          <div className="p-2 sm:p-4 flex-1 bg-gray-50 dark:bg-gray-800 overflow-auto">
            <Routes>
              <Route path="/" element={<FileExplorer />} />
              <Route path="/folder/:folderId" element={<FileExplorer />} />
              <Route path="/file/:fileId" element={<FileExplorer />} />
              <Route path="/folders" element={<FileExplorer filterType="folders" />} />
              <Route path="/starred" element={<FileExplorer filterType="starred" />} />
              <Route path="/recent" element={<FileExplorer filterType="recent" />} />
              <Route path="/tags" element={<FileExplorer filterType="tags" />} />
            </Routes>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

const CloudPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?return_to=/cloud');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
        <div className="fixed top-0 left-0 right-0 z-50 h-16 shadow-sm">
          <Navbar />
        </div>
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading LuvviX Cloud...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DecentralizedStorageProvider>
      <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
        <CloudContent />
      </div>
    </DecentralizedStorageProvider>
  );
};

export default CloudPage;
