
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Authentication from "@/components/Authentication";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

const AuthPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = `${t('nav.login')} | LuvviX ID`;
  }, [t]);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const addAccount = searchParams.get('add_account') === 'true';
  
  // Redirect to return URL or dashboard if already authenticated,
  // but only if not adding a new account
  useEffect(() => {
    if (user && !loading && !addAccount) {
      // Give the session time to fully establish before redirecting
      setTimeout(() => {
        if (returnTo) {
          console.log(`Redirecting to: ${returnTo}`);
          // Decode the return URL in case it's encoded
          const decodedReturnTo = decodeURIComponent(returnTo);
          navigate(decodedReturnTo);
        } else {
          navigate('/dashboard');
        }
      }, 500);
    }
  }, [user, loading, navigate, returnTo, addAccount]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-1">
      <div className="flex-grow">
        <Authentication 
          returnTo={returnTo} 
          addingAccount={addAccount} 
        />
      </div></div>
      
    </div>
  );
};

export default AuthPage;
