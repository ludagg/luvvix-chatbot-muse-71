import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MobileHome from './MobileHome';
import MobileCenter from './MobileCenter';
import MobileProfile from './MobileProfile';
import MobileServices from './MobileServices';
import MobileBottomNav from './MobileBottomNav';
import MobileAuthFlow from './MobileAuthFlow';
import { Toaster } from '@/components/ui/toaster';

const MobileAppWrapper = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && showAuth) {
    return (
      <MobileAuthFlow
        onSuccess={() => setShowAuth(false)}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <MobileHome />;
      case 'center':
        return <MobileCenter />;
      case 'services':
        return <MobileServices />;
      case 'profile':
        return user ? <MobileProfile /> : null;
      default:
        return <MobileHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>
      
      <MobileBottomNav 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onAuthRequired={() => setShowAuth(true)}
      />
      
      <Toaster />
    </div>
  );
};

export default MobileAppWrapper;
