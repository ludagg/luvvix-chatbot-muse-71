
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cloud, 
  Upload, 
  Download, 
  Star, 
  Tag, 
  Folder, 
  Clock, 
  Menu,
  X,
  HardDrive,
  Zap,
  Settings,
  Plus,
  Link as LinkIcon,
  Box,
  Database,
  Apple
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CloudStatus {
  totalFiles: number;
  usedStorage: number;
  syncing: boolean;
}

interface CloudSidebarProps {
  toggleSidebar: () => void;
  cloudStatus: CloudStatus;
  onExportCloud: () => void;
}

const CloudSidebar = ({ toggleSidebar, cloudStatus, onExportCloud }: CloudSidebarProps) => {
  const navigate = useNavigate();
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [credentials, setCredentials] = useState({ email: "", token: "" });
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storageUsedPercentage = Math.min((cloudStatus.usedStorage / (5 * 1024 * 1024 * 1024)) * 100, 100);

  const cloudProviders = [
    { id: 'dropbox', name: 'Dropbox', icon: Box, color: 'text-blue-600' },
    { id: 'google', name: 'Google Drive', icon: Database, color: 'text-green-600' },
    { id: 'onedrive', name: 'Microsoft OneDrive', icon: Cloud, color: 'text-blue-500' },
    { id: 'icloud', name: 'Apple iCloud', icon: Apple, color: 'text-gray-700' }
  ];

  const [connectedProviders, setConnectedProviders] = useState([
    { id: 'dropbox', name: 'Dropbox', files: 42, storage: '2.3 GB', connected: true },
    { id: 'google', name: 'Google Drive', files: 128, storage: '4.7 GB', connected: true }
  ]);

  const handleConnectProvider = () => {
    if (!selectedProvider || !credentials.email) {
      toast.error("Veuillez sélectionner un fournisseur et entrer vos identifiants");
      return;
    }

    // Simulate connection
    const provider = cloudProviders.find(p => p.id === selectedProvider);
    if (provider) {
      setConnectedProviders(prev => [...prev, {
        id: selectedProvider,
        name: provider.name,
        files: Math.floor(Math.random() * 100),
        storage: `${(Math.random() * 5).toFixed(1)} GB`,
        connected: true
      }]);
      
      toast.success(`${provider.name} connecté avec succès !`);
      setShowConnectDialog(false);
      setSelectedProvider("");
      setCredentials({ email: "", token: "" });
    }
  };

  const handleDisconnectProvider = (providerId: string) => {
    const provider = connectedProviders.find(p => p.id === providerId);
    if (provider) {
      setConnectedProviders(prev => prev.filter(p => p.id !== providerId));
      toast.success(`${provider.name} déconnecté`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-lg">LuvviX Cloud</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Cloud Providers Section */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Services Cloud Connectés
          </h3>
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Connecter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connecter un service cloud</DialogTitle>
                <DialogDescription>
                  Connectez vos comptes cloud pour une gestion centralisée avec l'IA
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider">Fournisseur cloud</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {cloudProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <provider.icon className={`h-4 w-4 ${provider.color}`} />
                            {provider.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email du compte</Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="token">Token d'accès (optionnel)</Label>
                  <Input
                    id="token"
                    type="password"
                    value={credentials.token}
                    onChange={(e) => setCredentials(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Token API"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleConnectProvider}>
                  Connecter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {connectedProviders.map((provider) => {
            const ProviderIcon = cloudProviders.find(p => p.id === provider.id)?.icon || Cloud;
            const providerColor = cloudProviders.find(p => p.id === provider.id)?.color || 'text-gray-600';
            
            return (
              <Card key={provider.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ProviderIcon className={`h-4 w-4 ${providerColor}`} />
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      <p className="text-xs text-gray-500">
                        {provider.files} fichiers • {provider.storage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisconnectProvider(provider.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/cloud"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <HardDrive className="h-4 w-4" />
          <span className="text-sm">Tous les fichiers</span>
        </Link>
        
        <Link
          to="/cloud/starred"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Star className="h-4 w-4" />
          <span className="text-sm">Favoris</span>
        </Link>
        
        <Link
          to="/cloud/recent"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm">Récents</span>
        </Link>
        
        <Link
          to="/cloud/folders"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Folder className="h-4 w-4" />
          <span className="text-sm">Dossiers</span>
        </Link>
        
        <Link
          to="/cloud/tags"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Tag className="h-4 w-4" />
          <span className="text-sm">Tags</span>
        </Link>
      </nav>

      <Separator />

      {/* Storage Stats */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Stockage utilisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{formatFileSize(cloudStatus.usedStorage)}</span>
              <span className="text-gray-500">/ 5 GB</span>
            </div>
            <Progress value={storageUsedPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{cloudStatus.totalFiles} fichiers</span>
              <span>{Math.round(storageUsedPercentage)}% utilisé</span>
            </div>
            
            {cloudStatus.syncing && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                Synchronisation...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button size="sm" className="w-full" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          
          <Button 
            size="sm" 
            className="w-full" 
            variant="outline"
            onClick={onExportCloud}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Button 
            size="sm" 
            className="w-full" 
            variant="outline"
            onClick={() => navigate('/cloud/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CloudSidebar;
