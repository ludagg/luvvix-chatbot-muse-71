
import { useState, useRef, useEffect } from 'react';
import { Upload, FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fileService } from '@/services/file-service';
import { Switch } from "@/components/ui/switch";
import { useDecentralizedStorage } from '@/hooks/use-ipfs';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  currentFolderId?: string;
  onUploadComplete: () => void;
}

const FileUploader = ({ currentFolderId, onUploadComplete }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [encrypt, setEncrypt] = useState(true);
  const [bucketChecked, setBucketChecked] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadProgress, isConnected } = useDecentralizedStorage();

  // Vérifier l'état du stockage au chargement
  useEffect(() => {
    const checkStorageStatus = async () => {
      try {
        const result = await checkBucketExists();
        if (!result) {
          setBucketError("Le stockage n'est pas disponible. Réessayez dans quelques instants.");
        } else {
          setBucketError(null);
        }
      } catch (error) {
        console.error("Error checking storage status:", error);
        setBucketError("Erreur lors de la vérification du stockage.");
      }
    };
    
    checkStorageStatus();
  }, [isConnected]);

  const checkBucketExists = async (): Promise<boolean> => {
    if (bucketChecked) return true;
    
    try {
      // Vérifier que les buckets existent
      let bucketsExist = false;
      
      try {
        const { data: cloudBucket, error: cloudError } = await supabase.storage.getBucket('cloud');
        const { data: metadataBucket, error: metadataError } = await supabase.storage.getBucket('metadata');
        
        if (cloudError || metadataError) {
          bucketsExist = false;
          console.log("Buckets don't exist, trying to create them");
        } else {
          bucketsExist = true;
          console.log("Buckets already exist:", { cloud: cloudBucket, metadata: metadataBucket });
        }
      } catch (checkError) {
        console.error("Error checking buckets:", checkError);
        bucketsExist = false;
      }
      
      // Si les buckets n'existent pas, essayer de les créer directement
      if (!bucketsExist) {
        try {
          // Création du bucket 'cloud'
          const { data: cloudBucket, error: cloudError } = await supabase.storage.createBucket('cloud', {
            public: false,
            fileSizeLimit: 100 * 1024 * 1024  // 100MB
          });
          
          if (cloudError) {
            console.error("Failed to create cloud bucket:", cloudError);
            // Si échec direct, essayer via l'edge function
            const setupResponse = await setupStorageViaEdgeFunction();
            return setupResponse;
          }
          
          // Création du bucket 'metadata'
          const { data: metadataBucket, error: metadataError } = await supabase.storage.createBucket('metadata', {
            public: false,
            fileSizeLimit: 5 * 1024 * 1024 // 5MB
          });
          
          if (metadataError) {
            console.error("Failed to create metadata bucket:", metadataError);
            // Si échec direct, essayer via l'edge function
            const setupResponse = await setupStorageViaEdgeFunction();
            return setupResponse;
          }
          
          console.log("Created storage buckets successfully");
          setBucketChecked(true);
          return true;
        } catch (createError) {
          console.error("Failed to create buckets directly:", createError);
          // Si échec, essayer via l'edge function
          const setupResponse = await setupStorageViaEdgeFunction();
          return setupResponse;
        }
      }
      
      console.log("Cloud buckets exist");
      setBucketChecked(true);
      return true;
    } catch (error) {
      console.error("Error during bucket check:", error);
      // En cas d'erreur, essayer via l'edge function
      const setupResponse = await setupStorageViaEdgeFunction();
      return setupResponse;
    }
  };
  
  const setupStorageViaEdgeFunction = async (): Promise<boolean> => {
    try {
      console.log("Trying to set up storage via edge function");
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/setup-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to setup storage: ${response.status}`);
        return false;
      }
      
      const result = await response.json();
      if (result.success) {
        console.log("Storage buckets created successfully via edge function");
        setBucketChecked(true);
        return true;
      } else {
        console.error("Edge function reported failure:", result.error);
        return false;
      }
    } catch (setupError) {
      console.error("Failed to setup storage buckets via edge function:", setupError);
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Vérifier la taille des fichiers
      const maxSize = 100 * 1024 * 1024; // 100 MB
      const oversizedFiles = filesArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "Fichiers trop volumineux",
          description: `${oversizedFiles.length} fichier(s) dépassent la limite de 100 Mo`,
          variant: "destructive",
        });
        
        // Filtrer les fichiers trop volumineux
        const validFiles = filesArray.filter(file => file.size <= maxSize);
        setSelectedFiles(validFiles);
      } else {
        setSelectedFiles(filesArray);
      }
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      
      // Vérifier la taille des fichiers
      const maxSize = 100 * 1024 * 1024; // 100 MB
      const oversizedFiles = filesArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "Fichiers trop volumineux",
          description: `${oversizedFiles.length} fichier(s) dépassent la limite de 100 Mo`,
          variant: "destructive",
        });
        
        // Filtrer les fichiers trop volumineux
        const validFiles = filesArray.filter(file => file.size <= maxSize);
        setSelectedFiles(validFiles);
      } else {
        setSelectedFiles(filesArray);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner au moins un fichier à télécharger",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que les buckets existent avant de commencer
    const bucketsOk = await checkBucketExists();
    if (!bucketsOk) {
      toast({
        title: "Stockage non disponible",
        description: "Impossible d'accéder à l'espace de stockage. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
      setBucketError("Stockage non disponible. Veuillez réessayer.");
      return;
    }
    
    // Réinitialiser l'erreur de bucket si tout va bien
    setBucketError(null);

    setIsUploading(true);
    
    try {
      let totalUploaded = 0;
      let failedUploads = 0;
      
      for (const file of selectedFiles) {
        try {
          // Upload each file with retry mechanism
          let uploadAttempts = 0;
          const maxAttempts = 3;
          let uploadSuccessful = false;
          let fileId = null;
          
          while (!uploadSuccessful && uploadAttempts < maxAttempts) {
            uploadAttempts++;
            
            try {
              console.log(`Tentative d'upload ${uploadAttempts}/${maxAttempts} pour ${file.name}`);
              fileId = await fileService.uploadFile(
                file,
                currentFolderId,
                [], // No tags initially
                false, // Not starred initially
                encrypt // Use encryption setting
              );
              
              if (fileId) {
                uploadSuccessful = true;
              } else {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant la prochaine tentative
              }
            } catch (uploadError) {
              console.error(`Erreur téléchargement ${file.name} (tentative ${uploadAttempts}):`, uploadError);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant la prochaine tentative
            }
          }
          
          if (uploadSuccessful) {
            totalUploaded++;
          } else {
            failedUploads++;
          }
        } catch (fileError) {
          console.error(`Erreur fatale pour ${file.name}:`, fileError);
          failedUploads++;
        }
      }
      
      // Message de réussite ou d'échec
      if (failedUploads === 0) {
        toast({
          title: "Téléchargement terminé",
          description: `${totalUploaded} fichier(s) téléchargé(s) avec succès`,
        });
      } else if (totalUploaded > 0) {
        toast({
          title: "Téléchargement partiel",
          description: `${totalUploaded} fichier(s) téléchargé(s), ${failedUploads} échec(s)`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Échec du téléchargement",
          description: "Aucun fichier n'a pu être téléchargé",
          variant: "destructive",
        });
        // Réessayer d'initialiser le stockage en cas d'échec total
        setBucketChecked(false);
        await checkBucketExists();
      }
      
      // Clear selected files
      setSelectedFiles([]);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur s'est produite lors du téléchargement des fichiers",
        variant: "destructive",
      });
    }
    
    setIsUploading(false);
  };

  const createFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Nom de dossier requis",
        description: "Veuillez entrer un nom pour le nouveau dossier",
        variant: "destructive",
      });
      return;
    }

    try {
      await fileService.createFolder(folderName, currentFolderId);
      
      toast({
        title: "Dossier créé",
        description: `Le dossier "${folderName}" a été créé avec succès`,
      });
      
      setFolderName('');
      setShowNewFolderDialog(false);
      onUploadComplete();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du dossier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      {bucketError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
          <h3 className="font-medium">Erreur de stockage</h3>
          <p className="text-sm">{bucketError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={async () => {
              setBucketChecked(false);
              const result = await checkBucketExists();
              if (result) {
                setBucketError(null);
                toast({
                  title: "Stockage disponible",
                  description: "La connexion au stockage a été rétablie avec succès",
                });
              }
            }}
          >
            Réessayer
          </Button>
        </div>
      )}
    
      {selectedFiles.length === 0 ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${bucketError ? 'opacity-50' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium">
            Glissez-déposez des fichiers ici ou cliquez pour parcourir
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Téléchargez vos fichiers en toute sécurité. Ils seront chiffrés avant stockage.
          </p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple 
            className="hidden" 
            accept="*/*"
            disabled={!!bucketError}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Fichiers sélectionnés ({selectedFiles.length})</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFiles([])}
              >
                Effacer tout
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="truncate flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.size < 1024 * 1024 
                        ? `${(file.size / 1024).toFixed(1)} KB` 
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="encrypt"
                checked={encrypt}
                onCheckedChange={setEncrypt}
              />
              <Label htmlFor="encrypt">Chiffrer les fichiers</Label>
            </div>
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-gray-500">
                Téléchargement en cours... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button 
                className="w-full"
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setShowNewFolderDialog(true)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau dossier
        </Button>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nom du dossier</Label>
              <Input 
                id="folderName" 
                value={folderName} 
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Mon dossier"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewFolderDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={createFolder}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploader;
