
import React, { useState } from 'react';
import { ArrowLeft, Folder, File, Download, Share, Trash2, Plus, Search } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: Date;
  path: string;
}

interface MobileFileManagerProps {
  onBack: () => void;
}

const MobileFileManager = ({ onBack }: MobileFileManagerProps) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files] = useState<FileItem[]>([
    { id: '1', name: 'Documents', type: 'folder', modified: new Date(), path: '/Documents' },
    { id: '2', name: 'Images', type: 'folder', modified: new Date(), path: '/Images' },
    { id: '3', name: 'Téléchargements', type: 'folder', modified: new Date(), path: '/Downloads' },
    { id: '4', name: 'document.pdf', type: 'file', size: '2.3 MB', modified: new Date(), path: '/document.pdf' },
    { id: '5', name: 'photo.jpg', type: 'file', size: '1.8 MB', modified: new Date(), path: '/photo.jpg' },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) 
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="w-8 h-8 text-red-500" />;
      case 'jpg':
      case 'png':
        return <File className="w-8 h-8 text-green-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Gestionnaire de fichiers</h1>
        <button className="p-2">
          <Search className="w-6 h-6" />
        </button>
      </div>
      
      {/* Path Breadcrumb */}
      <div className="p-4 bg-gray-50 border-b">
        <p className="text-sm text-gray-600">{currentPath}</p>
      </div>
      
      {/* Files Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => toggleSelection(file.id)}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                selectedFiles.includes(file.id) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="mr-3">
                {getFileIcon(file)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {file.size && <span>{file.size}</span>}
                  <span>•</span>
                  <span>{file.modified.toLocaleDateString()}</span>
                </div>
              </div>
              
              {selectedFiles.includes(file.id) && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {files.length === 0 && (
          <div className="text-center py-8">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dossier vide</h3>
            <p className="text-gray-600">Aucun fichier dans ce dossier</p>
          </div>
        )}
      </div>
      
      {/* Action Bar */}
      {selectedFiles.length > 0 && (
        <div className="p-4 bg-gray-100 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} sélectionné(s)
            </span>
            
            <div className="flex space-x-3">
              <button className="p-2 bg-blue-500 rounded-lg">
                <Share className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-green-500 rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-red-500 rounded-lg">
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <button className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <Plus className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default MobileFileManager;
