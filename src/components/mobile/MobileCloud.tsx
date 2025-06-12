
import React, { useState } from 'react';

const MobileCloud = () => {
  const [currentPath, setCurrentPath] = useState('/');
  
  const files = [
    { id: 1, name: 'Documents', type: 'folder', size: '', modified: '2025-06-12' },
    { id: 2, name: 'Images', type: 'folder', size: '', modified: '2025-06-11' },
    { id: 3, name: 'Projet_LuvviX.pdf', type: 'pdf', size: '2.5 MB', modified: '2025-06-12' },
    { id: 4, name: 'Présentation.pptx', type: 'pptx', size: '15.8 MB', modified: '2025-06-10' },
    { id: 5, name: 'Notes_reunion.docx', type: 'docx', size: '1.2 MB', modified: '2025-06-09' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return '📁';
      case 'pdf': return '📄';
      case 'pptx': return '📊';
      case 'docx': return '📝';
      default: return '📎';
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'folder': return 'bg-blue-100 text-blue-600';
      case 'pdf': return 'bg-red-100 text-red-600';
      case 'pptx': return 'bg-orange-100 text-orange-600';
      case 'docx': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cloud Storage</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
        </div>

        {/* Storage Usage */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Stockage utilisé</span>
            <span className="text-sm opacity-90">15.2 GB / 100 GB</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className="flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Importer</span>
          </button>
          
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

      {/* Files List */}
      <div className="flex-1 px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Fichiers récents</h3>
          </div>
          
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
                      {file.size && <span>{file.size}</span>}
                      <span>•</span>
                      <span>{file.modified}</span>
                    </div>
                  </div>
                  
                  <button className="p-1 hover:bg-gray-200 rounded">
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
