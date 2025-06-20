
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Share, Bookmark, Home, Search } from 'lucide-react';

interface MobileBrowserProps {
  onBack: () => void;
}

const MobileBrowser = ({ onBack }: MobileBrowserProps) => {
  const [url, setUrl] = useState('https://luvvix.it.com');
  const [loading, setLoading] = useState(false);
  const [bookmarks] = useState([
    'https://luvvix.it.com',
    'https://github.com',
    'https://google.com'
  ]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleNavigate = (newUrl: string) => {
    setUrl(newUrl);
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="flex items-center space-x-2 p-3 bg-gray-100 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="p-2">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
        <button onClick={handleRefresh} className={`p-2 ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={() => handleNavigate('https://luvvix.it.com')} className="p-2">
          <Home className="w-5 h-5" />
        </button>
      </div>
      
      {/* Address Bar */}
      <div className="p-3 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate(url)}
              className="w-full p-3 pl-10 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rechercher ou saisir une URL"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button className="p-3 bg-gray-100 rounded-full">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gray-100 rounded-full">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Web Content */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">LuvviX Browser</h1>
              <p className="text-gray-600">Navigateur web intégré</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Sites populaires</h3>
                <div className="grid grid-cols-2 gap-2">
                  {bookmarks.map((bookmark, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigate(bookmark)}
                      className="p-3 bg-white rounded-lg border text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🌐</span>
                        </div>
                        <span className="text-sm truncate">{bookmark}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Fonctionnalités</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Navigation web complète</li>
                  <li>• Signets et favoris</li>
                  <li>• Historique de navigation</li>
                  <li>• Mode incognito</li>
                  <li>• Synchronisation cross-platform</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom toolbar */}
      <div className="flex justify-around p-3 bg-gray-100 border-t">
        <button className="flex flex-col items-center p-2">
          <div className="w-8 h-8 bg-gray-300 rounded-lg mb-1"></div>
          <span className="text-xs text-gray-600">Onglets</span>
        </button>
        <button className="flex flex-col items-center p-2">
          <Bookmark className="w-5 h-5 mb-1" />
          <span className="text-xs text-gray-600">Favoris</span>
        </button>
        <button className="flex flex-col items-center p-2">
          <RefreshCw className="w-5 h-5 mb-1" />
          <span className="text-xs text-gray-600">Historique</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBrowser;
