import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AIStudioPage from "./pages/AIStudioPage";
import AIStudioChatPage from "./pages/AIStudioChatPage";
import AIStudioMarketplacePage from "./pages/AIStudioMarketplacePage";
import AIStudioCreateAgentPage from "./pages/AIStudioCreateAgentPage";
import AIStudioEditAgentPage from "./pages/AIStudioEditAgentPage";
import AIStudioFavoritesPage from "./pages/AIStudioFavoritesPage";
import AIStudioAdminPage from "./pages/AIStudioAdminPage";
import AIStudioLandingPage from "./pages/AIStudioLandingPage";

const ProtectedRoute = ({ children }: any) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" />;
};

const AdminTokenValidator = ({ children }: any) => {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      // Basic check, replace with a more secure method
      const isValidToken = token === "luvvix-id-admin-secret-token";

      setIsValid(isValidToken);
      setIsLoading(false);
    };

    checkToken();
  }, []);

  if (isLoading) {
    return <div>Checking admin status...</div>;
  }

  return isValid ? children : <Navigate to="/" />;
};

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />

        {/* Routes AI Studio */}
        <Route path="/ai-studio" element={<AIStudioLandingPage />} /> {/* Nouvelle route vers la landing page */}
        <Route path="/ai-studio/dashboard" element={<ProtectedRoute><AIStudioPage /></ProtectedRoute>} />
        <Route path="/ai-studio/agent/:agentId" element={<AIStudioChatPage />} />
        <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
        <Route path="/ai-studio/create" element={<ProtectedRoute><AIStudioCreateAgentPage /></ProtectedRoute>} />
        <Route path="/ai-studio/edit/:agentId" element={<ProtectedRoute><AIStudioEditAgentPage /></ProtectedRoute>} />
        <Route path="/ai-studio/favorites" element={<ProtectedRoute><AIStudioFavoritesPage /></ProtectedRoute>} />
        <Route path="/ai-studio/admin" element={<AdminTokenValidator><AIStudioAdminPage /></AdminTokenValidator>} />
      </Routes>
    </Router>
  );
}

export default App;
