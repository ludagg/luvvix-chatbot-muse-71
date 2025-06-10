
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudConnection from "@/components/cloud/CloudConnection";
import CloudHeader from "@/components/cloud/CloudHeader";
import CloudSidebar from "@/components/cloud/CloudSidebar";
import FileExplorer from "@/components/cloud/FileExplorer";
import { Button } from "@/components/ui/button";
import { Cloud, Settings, Grid, List } from "lucide-react";

const CloudPage = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'connections' | 'files'>('connections');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2">LuvviX Cloud</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connectez-vous pour accéder à vos fichiers cloud
            </p>
            <Button asChild>
              <a href="/auth">Se connecter</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex-grow">
        <CloudHeader />
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <Button
                variant={currentView === 'connections' ? 'default' : 'outline'}
                onClick={() => setCurrentView('connections')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Connexions
              </Button>
              <Button
                variant={currentView === 'files' ? 'default' : 'outline'}
                onClick={() => setCurrentView('files')}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Mes fichiers
              </Button>
            </div>

            {currentView === 'files' && (
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            {currentView === 'files' && (
              <div className="w-64 flex-shrink-0">
                <CloudSidebar />
              </div>
            )}
            
            <div className="flex-grow">
              {currentView === 'connections' ? (
                <CloudConnection />
              ) : (
                <FileExplorer viewMode={viewMode} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CloudPage;
