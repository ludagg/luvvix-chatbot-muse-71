
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatFileSize, formatDate } from '@/lib/utils';
import { FileIcon, FolderIcon, MoreVertical, Upload, FolderPlus, Download, Trash2, Edit, Share2, Eye } from 'lucide-react';
import FileUploader from './FileUploader';
import FileViewer from './FileViewer';
import ShareDialog from './ShareDialog';

interface FileItem {
  id: string;
  name: string;
  path: string;
  parent_path: string;
  type: 'file' | 'folder';
  mime_type?: string;
  size: number;
  url?: string;
  is_public?: boolean;
  shared_with?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

const FileExplorer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileItem | null>(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const path = location.pathname.replace('/cloud', '') || '/';
      setCurrentPath(path);
      fetchFiles(path);
    }
  }, [location.pathname, user]);

  const fetchFiles = async (path: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .eq('parent_path', path);
      
      if (error) throw error;
      
      setFiles(data || []);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Impossible de charger les fichiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folderPath = `${currentPath === '/' ? '' : currentPath}/${newFolderName}`;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('files')
        .insert({
          name: newFolderName,
          path: folderPath,
          parent_path: currentPath,
          type: 'folder',
          size: 0,
          user_id: user.id
        });
      
      if (error) throw error;
      
      toast.success(`Le dossier ${newFolderName} a été créé avec succès`);
      
      setNewFolderName('');
      setShowCreateFolderDialog(false);
      fetchFiles(currentPath);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Impossible de créer le dossier');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      for (const file of files) {
        const filePath = `${user.id}${currentPath === '/' ? '' : currentPath}/${file.name}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('user_files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('user_files')
          .getPublicUrl(filePath);
        
        // Add to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            path: `${currentPath === '/' ? '' : currentPath}/${file.name}`,
            parent_path: currentPath,
            type: 'file',
            mime_type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            user_id: user.id
          });
        
        if (dbError) throw dbError;
      }
      
      toast.success(`${files.length} fichier(s) téléchargé(s) avec succès`);
      
      setShowUploadDialog(false);
      fetchFiles(currentPath);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Impossible de télécharger les fichiers');
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigate(`/cloud${file.path}`);
    } else {
      setCurrentFile(file);
      setShowFileViewer(true);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      if (!file.url) {
        toast.error('URL de téléchargement non disponible');
        return;
      }
      
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = file.path.split('/').pop() || 'file'; // Fournir une valeur par défaut
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Impossible de télécharger le fichier');
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (file.type === 'file') {
        const filePath = `${user.id}${file.path}`;
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('user_files')
          .remove([filePath]);
        
        if (storageError) throw storageError;
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);
      
      if (dbError) throw dbError;
      
      toast.success(`${file.name} a été supprimé avec succès`);
      
      fetchFiles(currentPath);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Impossible de supprimer le fichier');
    }
  };

  const handleShare = (file: FileItem) => {
    setFileToShare(file);
    setShowShareDialog(true);
  };

  const handleSelectFile = (file: FileItem) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return;
    
    try {
      for (const file of selectedFiles) {
        await handleDelete(file);
      }
      
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    // Always sort folders before files
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    // Then sort by the selected field
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'size') {
      comparison = a.size - b.size;
    } else if (sortField === 'updated_at') {
      comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-4 overflow-x-auto whitespace-nowrap">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/cloud')}
          className="flex items-center"
        >
          <FolderIcon className="mr-1 h-4 w-4" />
          Accueil
        </Button>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <span className="mx-2 text-gray-500">/</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/cloud/${breadcrumbs.slice(0, index + 1).join('/')}`)}
            >
              {crumb}
            </Button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        
        <Button variant="outline" onClick={() => setShowCreateFolderDialog(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Nouveau dossier
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedFiles.length})
          </Button>
        )}
      </div>
      
      {/* Files table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={files.length > 0 && selectedFiles.length === files.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('size')}>
                Taille {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('updated_at')}>
                Modifié le {sortField === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : sortedFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Ce dossier est vide
                </TableCell>
              </TableRow>
            ) : (
              sortedFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onCheckedChange={() => handleSelectFile(file)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleFileClick(file)}
                  >
                    {file.type === 'folder' ? (
                      <FolderIcon className="mr-2 h-5 w-5 text-blue-500" />
                    ) : (
                      <FileIcon className="mr-2 h-5 w-5 text-gray-500" />
                    )}
                    <span>{file.name}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {file.type === 'folder' ? '—' : formatFileSize(file.size)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(file.updated_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {file.type !== 'folder' && (
                          <DropdownMenuItem onClick={() => handleFileClick(file)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualiser
                          </DropdownMenuItem>
                        )}
                        {file.type !== 'folder' && (
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleShare(file)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Partager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(file)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Télécharger des fichiers</DialogTitle>
          </DialogHeader>
          <FileUploader onUpload={handleFileUpload} />
        </DialogContent>
      </Dialog>
      
      {/* Create folder dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier"
            className="mb-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFolder}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* File viewer */}
      {currentFile && (
        <FileViewer
          file={currentFile}
          open={showFileViewer}
          onClose={() => {
            setShowFileViewer(false);
            setCurrentFile(null);
          }}
        />
      )}
      
      {/* Share dialog */}
      {fileToShare && (
        <ShareDialog
          file={fileToShare}
          open={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
            setFileToShare(null);
          }}
        />
      )}
    </div>
  );
};

export default FileExplorer;
