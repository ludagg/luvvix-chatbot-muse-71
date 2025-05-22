
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CloudLink from "./CloudLink";
import { 
  Menu, 
  Home, 
  Folders, 
  Star, 
  Clock, 
  Tag, 
  Trash, 
  Settings, 
  Upload, 
  Download, 
  RefreshCcw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fileService } from "@/services/file-service";

interface CloudSidebarProps {
  toggleSidebar: () => void;
  cloudStatus?: {
    totalFiles: number;
    usedStorage: number;
    syncing: boolean;
  };
  onExportCloud?: () => void;
}

const CloudSidebar = ({ toggleSidebar, cloudStatus, onExportCloud }: CloudSidebarProps) => {
  const navigate = useNavigate();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const usedPercentage = Math.min(
    Math.round((cloudStatus?.usedStorage || 0) / (1024 * 1024 * 1024) * 100), 
    100
  );
  
  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleSync = async () => {
    try {
      toast.success("Synchronisation avec le cloud en cours...");
      
      await fileService.syncFilesFromSupabase();
      
      toast.success("Vos fichiers sont à jour");
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Impossible de synchroniser vos fichiers");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Veuillez sélectionner un fichier d'export LuvviX Cloud");
      return;
    }
    
    setImporting(true);
    
    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);
      
      await fileService.importFiles(importData);
      
      toast.success("Vos fichiers ont été importés avec succès");
      
      setShowImportDialog(false);
      setImportFile(null);
      // Refresh the current page
      navigate(0);
    } catch (error) {
      console.error("Error importing cloud:", error);
      toast.error("Le fichier d'import semble être invalide ou corrompu");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">LuvviX Cloud</h2>
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-1 flex-1">
        <CloudLink icon={Home} to="/cloud" label="Accueil" />
        <CloudLink icon={Folders} to="/cloud/folders" label="Dossiers" />
        <CloudLink icon={Star} to="/cloud/starred" label="Favoris" />
        <CloudLink icon={Clock} to="/cloud/recent" label="Récents" />
        <CloudLink icon={Tag} to="/cloud/tags" label="Tags" />
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="mb-2 text-sm font-medium flex justify-between">
          <span>Stockage</span>
          <span>
            {formatStorageSize(cloudStatus?.usedStorage || 0)} / 10 GB
          </span>
        </div>
        <Progress value={usedPercentage} className="h-2" />
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {cloudStatus?.totalFiles || 0} fichier(s)
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleSync}
          disabled={cloudStatus?.syncing}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${cloudStatus?.syncing ? 'animate-spin' : ''}`} />
          Synchroniser
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={onExportCloud}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => setShowImportDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Importer
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link to="/settings/cloud">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Link>
        </Button>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer Cloud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="importFile">Fichier d'export LuvviX Cloud</Label>
              <div className="flex items-center">
                <input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <p className="text-xs text-gray-500">
                Sélectionnez le fichier JSON exporté précédemment depuis LuvviX Cloud
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
              disabled={importing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importFile || importing}
            >
              {importing ? 'Importation...' : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CloudSidebar;
