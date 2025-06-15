import React, { useState, useEffect } from 'react';
import { useCloudConnections } from '@/hooks/use-cloud-connections';
import { fileService } from '@/services/file-service';
import { Cloud, CheckCircle, Link as LinkIcon, Unlink, Shield } from 'lucide-react';
import { useDropboxSync } from '@/hooks/useDropboxSync';
import DropboxFileBrowser from "@/components/cloud/DropboxFileBrowser";
import DropboxFileBrowserMobile from "@/components/cloud/DropboxFileBrowserMobile";

const MobileCloud = () => {
  const [currentPath] = useState('/');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedStorage, setUsedStorage] = useState(0);
  const [showKoofr, setShowKoofr] = useState(false);
  const [showDropboxBrowser, setShowDropboxBrowser] = useState(false);
  const { syncDropboxAndCloud } = useDropboxSync();

  // Connexion Koofr/Dropbox user
  const {
    connections,
    isKoofrConnected,
    getKoofrConnection,
    isDropboxConnected,
    getDropboxConnection,
    connectKoofr,
    connectDropbox,
    disconnectCloud,
    loading: koofrLoading
  } = useCloudConnections();

  // NEW: Dropbox connecté ?
  const dropboxConn = getDropboxConnection();
  const dropboxConnected = isDropboxConnected();

  // Synchronisation automatique Dropbox <-> Cloud à l'ouverture mobile
  useEffect(() => {
    if (dropboxConnected) {
      syncDropboxAndCloud();
    }
  }, [dropboxConnected]);

  // Charger les vrais fichiers Cloud utilisateur
  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const realFiles = await fileService.listFiles();
        setFiles(realFiles || []);
        let total = 0;
        if (realFiles && realFiles.length > 0) {
          total = realFiles
            .filter((f: any) => f.type !== 'folder')
            .reduce((sum: number, f: any) => sum + (f.size || 0), 0);
        }
        setUsedStorage(total);
      } catch (e) {
        setFiles([]);
        setUsedStorage(0);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  // Pourcentage utilisé pour la barre
  const quota = 50 * 1024 * 1024 * 1024; // 50 Go par défaut pour Mega
  const percent = Math.min(100, Math.round((usedStorage / quota) * 100));

  // Formatage stockage
  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Icône selon le type de fichier
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return '📁';
      case 'application/pdf':
        return '📄';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        return '📊';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝';
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/svg+xml':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'folder':
        return 'bg-blue-100 text-blue-600';
      case 'application/pdf':
        return 'bg-red-100 text-red-600';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        return 'bg-orange-100 text-orange-600';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'bg-blue-100 text-blue-600';
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/svg+xml':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get main Koofr connection
  const koofrConn = getKoofrConnection();
  const connectedEmail = koofrConn?.account_info?.email || null;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cloud Storage</h2>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowKoofr((s) => !s)}
            aria-label="Koofr Connection Info"
          >
            <Shield className="w-5 h-5 text-green-600" />
          </button>
        </div>

        {/* Usage & bar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Stockage utilisé</span>
            <span className="text-sm opacity-90">
              {formatBytes(usedStorage)} / 50 GB
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((usedStorage / (50 * 1024 * 1024 * 1024)) * 100))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Koofr connection info */}
      {showKoofr && (
        <div className="p-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,10L12,14L8.5,10L12,6Z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-base flex items-center gap-1">
                  Koofr {isKoofrConnected() && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <div className="text-xs text-gray-600">
                  {isKoofrConnected() 
                    ? <>Connecté&nbsp;<span className="text-gray-900">{connectedEmail}</span></>
                    : "Non connecté - activez Koofr pour 10GB sécurisé"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Importer/Explorer Dropbox button */}
          <button
            className={`flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${
              !dropboxConnected ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => setShowDropboxBrowser(true)}
            disabled={!dropboxConnected}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Dropbox</span>
          </button>
          
          {/* Import ou Nouveau */}
          <button className="flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Nouveau</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Partager</span>
          </button>
        </div>
      </div>

      {/* NEW: Affichage du navigateur Dropbox complet (modal recouvre tout) */}
      {showDropboxBrowser && dropboxConnected && (
        <DropboxFileBrowserMobile 
          onClose={() => setShowDropboxBrowser(false)}
          onRefresh={() => setShowDropboxBrowser(false) || setShowDropboxBrowser(true)} // Hack: refresh hard reset
        />
      )}

      {/* Files List */}
      <div className="flex-1 px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Vos fichiers Cloud</h3>
          </div>
          
          {loading && (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          )}
          
          {!loading && files.length === 0 && (
            <div className="p-6 text-center text-gray-400">Aucun fichier pour le moment.</div>
          )}

          <div className="divide-y divide-gray-100">
            {files.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{file.type === 'folder' ? 'Dossier' : formatBytes(file.size || 0)}</span>
                      <span>•</span>
                      <span>{file.modified ? new Date(file.modified).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  
                  <button className="p-1 hover:bg-gray-200 rounded" aria-label="Fichier options">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCloud;
