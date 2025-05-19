
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useCrossAppAuth } from '@/hooks/use-cross-app-auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { isAuthenticated, isInitialized } = useCrossAppAuth({ 
    appName: 'main', 
    autoInit: true 
  });

  useEffect(() => {
    // Set a flag once the initial auth check is complete
    if (!loading && isInitialized) {
      setInitialCheckDone(true);
    }
  }, [loading, isInitialized]);

  // Show loading indicator during initial auth check
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-700">Vérification de l'authentification...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated, passing the current path as return_to
  if (!user && !isAuthenticated) {
    // Include both pathname and search params in the return URL
    const fullPath = `${location.pathname}${location.search}`;
    const returnPath = encodeURIComponent(fullPath);
    
    console.log(`ProtectedRoute: User not authenticated`);
    console.log(`ProtectedRoute: Current location:`, location);
    console.log(`ProtectedRoute: Encoded return path: ${returnPath}`);
    console.log(`ProtectedRoute: Redirecting to: /auth?return_to=${returnPath}`);
    
    return <Navigate to={`/auth?return_to=${returnPath}`} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
