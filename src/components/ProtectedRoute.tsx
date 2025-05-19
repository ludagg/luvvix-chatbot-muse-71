
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Set a flag once the initial auth check is complete
    if (!loading) {
      setInitialCheckDone(true);
    }
  }, [loading]);

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
  if (!user) {
    return <Navigate to={`/auth?return_to=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
