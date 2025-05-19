
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useCrossAppAuth } from '@/hooks/use-cross-app-auth';
import authSync from '@/services/auth-sync';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [crossDomainChecked, setCrossDomainChecked] = useState(false);
  const { isAuthenticated, isInitialized, revalidateAuth } = useCrossAppAuth({ 
    appName: 'main', 
    autoInit: true,
    checkSubdomainAuth: true
  });

  // Force a sync when the component mounts to ensure cross-domain consistency
  useEffect(() => {
    authSync.forceSync();
  }, []);

  // Check for authentication across subdomains
  useEffect(() => {
    const checkCrossDomainAuth = async () => {
      if (isInitialized && !user && isAuthenticated) {
        // We might be authenticated on a subdomain but not on the main domain
        // Try to revalidate auth
        console.log("ProtectedRoute: Cross-domain auth check - authenticated on subdomain but not main domain");
        await revalidateAuth();
      }
      setCrossDomainChecked(true);
    };
    
    if (isInitialized) {
      checkCrossDomainAuth();
    }
  }, [isInitialized, isAuthenticated, user, revalidateAuth]);

  // Set a flag once all auth checks are complete
  useEffect(() => {
    if (!loading && isInitialized && crossDomainChecked) {
      console.log("ProtectedRoute: All auth checks complete");
      console.log("ProtectedRoute: Main auth user:", user ? "Authenticated" : "Not authenticated");
      console.log("ProtectedRoute: Cross app auth:", isAuthenticated ? "Authenticated" : "Not authenticated");
      setInitialCheckDone(true);
    }
  }, [loading, isInitialized, crossDomainChecked, user, isAuthenticated]);

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
