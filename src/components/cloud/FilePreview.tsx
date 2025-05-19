
import { useState, useEffect } from 'react';
import { FileText, Download, Share, Star, Edit, Trash2, ArrowLeft, FileCog, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileMetadata } from '@/services/db-service';
import { fileService } from '@/services/file-service';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FilePreviewProps {
  fileId: string;
  onBack: () => void;
  onUpdate: () => void;
}

const FilePreview = ({ fileId, onBack, onUpdate }: FilePreviewProps) => {
  const [file, setFile] = useState<{ metadata: FileMetadata; content: Blob } | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [shareLink, setShareLink] = useState('');
  const [isTextContent, setIsTextContent] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFile();
    
    return () => {
      // Clean up any object URLs when component unmounts
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [fileId]);

  const loadFile = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      console.log(`Loading file with ID: ${fileId}`);
      const fileData = await fileService.getFile(fileId);
      
      if (fileData) {
        console.log(`File loaded successfully: ${fileData.metadata.name}`);
        setFile(fileData);
        setFileName(fileData.metadata.name);
        
        // Generate preview URL
        const url = URL.createObjectURL(fileData.content);
        setPreviewUrl(url);
        
        // Check if it's a text file
        if (fileData.metadata.type.startsWith('text/') || 
            fileData.metadata.type === 'application/json') {
          const text = await fileData.content.text();
          setTextContent(text);
          setIsTextContent(true);
        } else {
          setIsTextContent(false);
        }
      } else {
        console.error(`Failed to load file with ID: ${fileId}`);
        setLoadError("Le fichier n'a pas pu être chargé depuis le stockage local ou le cloud.");
        toast({
          title: "Fichier non disponible",
          description: "Le fichier n'a pas pu être chargé. Essayez de synchroniser à nouveau.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setLoadError(`Erreur lors du chargement du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      toast({
        title: "Erreur",
        description: "Impossible de charger le fichier. Essayez de synchroniser à nouveau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      toast({
        title: "Synchronisation en cours",
        description: "Tentative de récupération du fichier depuis le cloud..."
      });
      
      // Force synchronization from Supabase to try to retrieve the file
      await fileService.syncFilesFromSupabase();
      
      toast({
        title: "Synchronisation terminée",
        description: "Tentative de rechargement du fichier..."
      });
      
      // Reload the file
      await loadFile();
    } catch (error) {
      console.error('Error retrying file load:', error);
      toast({
        title: "Échec de la récupération",
        description: "Le fichier reste introuvable après synchronisation.",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  const handleDownload = () => {
    if (file && previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = file.metadata.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const toggleStar = async () => {
    if (file) {
      try {
        await fileService.updateFile(fileId, {
          starred: !file.metadata.starred
        });
        
        // Update local state
        setFile({
          ...file,
          metadata: {
            ...file.metadata,
            starred: !file.metadata.starred
          }
        });
        
        toast({
          title: file.metadata.starred ? "Retiré des favoris" : "Ajouté aux favoris",
          description: `${file.metadata.name} a été ${file.metadata.starred ? "retiré des" : "ajouté aux"} favoris`,
        });
        
        onUpdate();
      } catch (error) {
        console.error('Error updating star status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut favori",
          variant: "destructive",
        });
      }
    }
  };

  const saveNameChange = async () => {
    if (file && fileName !== file.metadata.name) {
      try {
        await fileService.updateFile(fileId, {
          name: fileName
        });
        
        // Update local state
        setFile({
          ...file,
          metadata: {
            ...file.metadata,
            name: fileName
          }
        });
        
        toast({
          title: "Nom mis à jour",
          description: "Le nom du fichier a été modifié avec succès",
        });
        
        setEditing(false);
        onUpdate();
      } catch (error) {
        console.error('Error updating file name:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le nom du fichier",
          variant: "destructive",
        });
      }
    } else {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      try {
        await fileService.deleteFile(fileId);
        
        toast({
          title: "Fichier supprimé",
          description: "Le fichier a été supprimé avec succès",
        });
        
        onBack();
        onUpdate();
      } catch (error) {
        console.error('Error deleting file:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le fichier",
          variant: "destructive",
        });
      }
    }
  };

  const createShareLink = async () => {
    try {
      const linkToken = await fileService.createSharedLink(fileId, expiryDays);
      const shareUrl = `${window.location.origin}/share/${linkToken}`;
      setShareLink(shareUrl);
      
      toast({
        title: "Lien de partage créé",
        description: `Le lien expirera dans ${expiryDays} jours`,
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien de partage",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Lien copié",
      description: "Lien de partage copié dans le presse-papiers",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p>Chargement du fichier...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center p-8 space-y-6">
        <div>
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <p className="text-lg text-red-500 mt-4 font-medium">Fichier non trouvé</p>
          <p className="text-gray-500 mt-2">
            {loadError || "Le fichier que vous cherchez n'est pas disponible ou n'existe pas."}
            <br />
            Essayez de synchroniser à nouveau pour le récupérer depuis le cloud.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRetry} 
            disabled={retrying}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Synchronisation...' : 'Synchroniser et réessayer'}
          </Button>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} octets`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleStar}
                >
                  <Star className={`h-5 w-5 ${file.metadata.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {file.metadata.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Télécharger
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Partager
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Renommer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRetry}
                  className="text-blue-500"
                >
                  <RefreshCw className={`h-5 w-5 ${retrying ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Resynchroniser ce fichier
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Supprimer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex items-center">
        {editing ? (
          <div className="flex w-full">
            <Input 
              value={fileName} 
              onChange={(e) => setFileName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveNameChange} className="ml-2">
              Sauvegarder
            </Button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {file.metadata.name}
          </h2>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-sm">
          <p><span className="font-medium">Type:</span> {file.metadata.type}</p>
          <p><span className="font-medium">Taille:</span> {formatFileSize(file.metadata.size)}</p>
        </div>
        <div className="text-sm">
          <p><span className="font-medium">Créé:</span> {formatDate(file.metadata.created)}</p>
          <p><span className="font-medium">Modifié:</span> {formatDate(file.metadata.modified)}</p>
        </div>
      </div>
      
      {file.metadata.encrypted && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded-md text-sm flex items-center">
          <FileCog className="h-4 w-4 mr-2" />
          Ce fichier est chiffré et sécurisé
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        {file.metadata.type.startsWith('image/') ? (
          <img 
            src={previewUrl || ''} 
            alt={file.metadata.name}
            className="max-w-full mx-auto"
          />
        ) : file.metadata.type.startsWith('video/') ? (
          <video 
            src={previewUrl || ''} 
            controls 
            className="max-w-full mx-auto"
          />
        ) : file.metadata.type.startsWith('audio/') ? (
          <audio 
            src={previewUrl || ''} 
            controls 
            className="w-full"
          />
        ) : isTextContent ? (
          <pre className="p-4 overflow-auto max-h-96 text-sm bg-gray-50 dark:bg-gray-800">
            {textContent}
          </pre>
        ) : file.metadata.type === 'application/pdf' ? (
          <iframe 
            src={`${previewUrl}#toolbar=0&navpanes=0`} 
            className="w-full h-96" 
            title={file.metadata.name}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-2" />
            <p>Aperçu non disponible</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger le fichier
            </Button>
          </div>
        )}
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager "{file.metadata.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {shareLink ? (
              <div className="space-y-2">
                <Label htmlFor="shareLink">Lien de partage</Label>
                <div className="flex">
                  <Input 
                    id="shareLink" 
                    value={shareLink} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button onClick={copyShareLink} className="ml-2">
                    Copier
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Ce lien expirera dans {expiryDays} jours
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Expiration du lien (jours)</Label>
                <Input 
                  id="expiryDays" 
                  type="number" 
                  min="1" 
                  max="30" 
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))} 
                />
                <p className="text-sm text-gray-500">
                  {file.metadata.encrypted ? (
                    "Ce fichier est chiffré. Seules les personnes disposant de la clé pourront le déchiffrer."
                  ) : (
                    "Note: Ce fichier n'est pas chiffré. Toute personne disposant du lien pourra y accéder."
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            {shareLink ? (
              <Button 
                variant="outline" 
                onClick={() => setShowShareDialog(false)}
              >
                Fermer
              </Button>
            ) : (
              <Button onClick={createShareLink}>
                Créer un lien de partage
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilePreview;
