import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Folder, File, Star, Tag, Upload, FolderPlus, ArrowLeft, RefreshCw } from 'lucide-react';
import { FileMetadata } from '@/services/db-service';
import { fileService } from '@/services/file-service';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';
import FilePreview from './FilePreview';
import { useAuth } from '@/hooks/useAuth';
import DropboxFileBrowser from "./DropboxFileBrowser";

interface FileExplorerProps {
  folderId?: string;
  filterType?: 'folders' | 'starred' | 'recent' | 'tags';
  viewMode?: 'grid' | 'list';
}

const FileExplorer = ({ folderId, filterType, viewMode = 'grid' }: FileExplorerProps) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id?: string; name: string }>>([]);
  const [showDropbox, setShowDropbox] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fileId } = useParams<{ fileId?: string; folderId?: string }>();
  const params = useParams();

  useEffect(() => {
    // Si fileId est défini dans les params, il a priorité sur la prop
    const effectiveFolderId = params.folderId || folderId;
    
    if (user) {
      syncWithCloud();
      loadFiles(effectiveFolderId);
    }
  }, [user, folderId, params.folderId, filterType]);

  useEffect(() => {
    if (fileId) {
      setSelectedFileId(fileId);
    } else {
      setSelectedFileId(null);
    }
  }, [fileId]);

  // Load breadcrumbs when folder changes
  useEffect(() => {
    const effectiveFolderId = params.folderId || folderId;
    loadBreadcrumbs(effectiveFolderId);
  }, [folderId, params.folderId]);

  const syncWithCloud = async () => {
    try {
      setSyncing(true);
      toast({
        title: "Synchronisation en cours",
        description: "Récupération de vos fichiers depuis le cloud..."
      });
      
      // On first load, sync files from Supabase
      await fileService.syncFilesFromSupabase();
      
      toast({
        title: "Synchronisation terminée",
        description: "Tous vos fichiers sont à jour"
      });
    } catch (error) {
      console.error('Error syncing with cloud:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec le cloud",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const loadFiles = async (effectiveFolderId?: string) => {
    setLoading(true);
    try {
      let filesList: FileMetadata[] = [];
      
      if (filterType === 'folders') {
        // Charger uniquement les dossiers
        filesList = await fileService.listFiles();
        filesList = filesList.filter(file => file.type === 'folder');
      } else if (filterType === 'starred') {
        // Charger uniquement les fichiers favoris
        filesList = await fileService.listFiles();
        filesList = filesList.filter(file => file.starred);
      } else if (filterType === 'recent') {
        // Charger les fichiers récents (triés par date de modification)
        filesList = await fileService.listFiles();
        filesList.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
        filesList = filesList.slice(0, 20); // Limiter aux 20 plus récents
      } else if (filterType === 'tags') {
        // Afficher les fichiers avec des tags
        filesList = await fileService.listFiles();
        filesList = filesList.filter(file => file.tags && file.tags.length > 0);
      } else {
        // Chargement normal par dossier
        filesList = await fileService.listFiles(effectiveFolderId);
      }
      
      setFiles(filesList);
      console.log('Files loaded:', filesList.length);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fichiers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBreadcrumbs = async (effectiveFolderId?: string) => {
    if (!effectiveFolderId) {
      let title = "Mes Fichiers";
      if (filterType === 'folders') title = "Tous les dossiers";
      if (filterType === 'starred') title = "Fichiers favoris";
      if (filterType === 'recent') title = "Fichiers récents";
      if (filterType === 'tags') title = "Fichiers avec tags";
      
      setBreadcrumbs([{ name: title }]);
      return;
    }
    
    try {
      const crumbs: Array<{ id?: string; name: string }> = [{ name: 'Mes Fichiers' }];
      let currentId = effectiveFolderId;
      let loopGuard = 0; // Prevent infinite loops
      
      while (currentId && loopGuard < 10) {
        const folder = await fileService.getFile(currentId);
        if (folder && folder.metadata) {
          crumbs.unshift({ id: folder.metadata.id, name: folder.metadata.name });
          currentId = folder.metadata.parentFolderId;
        } else {
          break;
        }
        loopGuard++;
      }
      
      setBreadcrumbs(crumbs);
    } catch (error) {
      console.error('Error loading breadcrumbs:', error);
    }
  };

  const handleFolderClick = (id: string) => {
    navigate(`/cloud/folder/${id}`);
  };

  const handleFileClick = (id: string) => {
    setSelectedFileId(id);
    navigate(`/cloud/file/${id}`);
  };

  const handleBreadcrumbClick = (id?: string) => {
    if (id) {
      navigate(`/cloud/folder/${id}`);
    } else {
      navigate('/cloud');
    }
  };

  const handleBackFromPreview = () => {
    setSelectedFileId(null);
    const effectiveFolderId = params.folderId || folderId;
    if (effectiveFolderId) {
      navigate(`/cloud/folder/${effectiveFolderId}`);
    } else {
      navigate('/cloud');
    }
  };

  const handleManualSync = async () => {
    await syncWithCloud();
    const effectiveFolderId = params.folderId || folderId;
    loadFiles(effectiveFolderId);
  };

  const filteredFiles = files.filter(file => {
    // First apply tab filter
    if (activeTab === 'starred' && !file.starred) return false;
    if (activeTab === 'folders' && file.type !== 'folder') return false;
    if (activeTab === 'files' && file.type === 'folder') return false;
    
    // Then apply search filter if there's a search term
    if (searchTerm.trim()) {
      return file.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });
  
  // Sort files: folders first, then by name
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type === 'folder') return <Folder className="h-8 w-8 text-blue-500" />;
    
    if (type.startsWith('image/')) return <File className="h-8 w-8 text-green-500" />;
    if (type.startsWith('video/')) return <File className="h-8 w-8 text-red-500" />;
    if (type.startsWith('audio/')) return <File className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('text/')) return <File className="h-8 w-8 text-yellow-500" />;
    if (type === 'application/pdf') return <File className="h-8 w-8 text-red-700" />;
    
    return <File className="h-8 w-8 text-gray-500" />;
  };
  
  // Content to display if there are no files
  const emptyState = (
    <div className="text-center p-12">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-semibold">Aucun fichier</h3>
      <p className="mt-1 text-gray-500">Commencez à télécharger des fichiers ou créez un nouveau dossier</p>
      <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Button onClick={() => setShowUploader(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        <Button variant="outline" onClick={() => setShowUploader(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau dossier
        </Button>
        <Button variant="secondary" onClick={handleManualSync}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Synchroniser
        </Button>
      </div>
    </div>
  );

  // Show single file preview if a file is selected
  if (selectedFileId) {
    return (
      <FilePreview 
        fileId={selectedFileId} 
        onBack={handleBackFromPreview}
        onUpdate={() => loadFiles(params.folderId || folderId)}
      />
    );
  }

  // Déterminer le titre basé sur filterType
  let pageTitle = "Mes Fichiers";
  if (filterType === 'folders') pageTitle = "Tous les dossiers";
  if (filterType === 'starred') pageTitle = "Fichiers favoris";
  if (filterType === 'recent') pageTitle = "Fichiers récents";
  if (filterType === 'tags') pageTitle = "Fichiers avec tags";

  // Use viewMode for styling (you can customize this further)
  const gridClasses = viewMode === 'list' 
    ? "flex flex-col space-y-2" 
    : "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="space-y-4">
      {/* Boutons pour basculer entre vues Cloud interne / Dropbox */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={!showDropbox ? 'default' : 'outline'}
          onClick={() => setShowDropbox(false)}
        >
          Mes Fichiers LuvviX
        </Button>
        <Button
          variant={showDropbox ? 'default' : 'outline'}
          onClick={() => setShowDropbox(true)}
        >
          Dropbox
        </Button>
      </div>

      {/* Vue Dropbox : exploration de son compte */}
      {showDropbox ? (
        <DropboxFileBrowser />
      ) : (
        // Main content: either uploader or file list
        showUploader ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <Button variant="outline" onClick={() => setShowUploader(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux fichiers
              </Button>
            </div>
            <FileUploader 
              currentFolderId={params.folderId || folderId} 
              onUploadComplete={() => {
                loadFiles(params.folderId || folderId);
                setShowUploader(false);
              }} 
            />
          </div>
        ) : (
          <>
            {/* Search and actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher des fichiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowUploader(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleManualSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Synchroniser
                </Button>
              </div>
            </div>
            
            {/* Tab filters */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="folders">Dossiers</TabsTrigger>
                <TabsTrigger value="files">Fichiers</TabsTrigger>
                <TabsTrigger value="starred">Favoris</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                {loading ? (
                  <div className={gridClasses}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : sortedFiles.length > 0 ? (
                  <div className={gridClasses}>
                    {sortedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative group ${
                          viewMode === 'list' ? 'flex items-center space-x-4' : ''
                        }`}
                        onClick={() => file.type === 'folder' ? handleFolderClick(file.id) : handleFileClick(file.id)}
                      >
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          {file.starred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 absolute top-2 right-2" />
                          )}
                        </div>
                        <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-2'}`}>
                          <p className="font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.type === 'folder' ? 'Dossier' : `${(file.size / 1024).toFixed(1)} KB`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(file.modified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  emptyState
                )}
              </TabsContent>
            </Tabs>
          </>
        )
      )}
    </div>
  );
};

export default FileExplorer;
