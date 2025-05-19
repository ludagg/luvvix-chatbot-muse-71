
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Authentication from "@/components/Authentication";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useCrossAppAuth } from "@/hooks/use-cross-app-auth";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const addAccount = searchParams.get('add_account') === 'true';
  
  const { isAuthenticated, isInitialized } = useCrossAppAuth({
    appName: 'main',
    redirectUrl: window.location.origin,
    autoInit: true
  });
  
  // Redirect to return URL or dashboard if already authenticated,
  // but only if not adding a new account
  useEffect(() => {
    if ((user || isAuthenticated) && !loading && isInitialized && !addAccount) {
      // Debug info
      console.log("AuthPage: User is authenticated, preparing to redirect");
      console.log("Return to path:", returnTo);
      
      // Give the session time to fully establish before redirecting
      const timer = setTimeout(() => {
        if (returnTo) {
          const decodedPath = decodeURIComponent(returnTo);
          console.log(`AuthPage: Redirecting user to: ${decodedPath}`);
          navigate(decodedPath, { replace: true });
        } else {
          console.log("AuthPage: No return_to path, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        }
      }, 1000); // Increased timeout to ensure session is ready
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, loading, isInitialized, navigate, returnTo, addAccount]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Authentication 
          returnTo={returnTo} 
          addingAccount={addAccount} 
        />
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;
