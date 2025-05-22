
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import NewsListingPage from "@/pages/NewsListingPage";
import NewsArticlePage from "@/pages/NewsArticlePage";
import CloudPage from "@/pages/CloudPage"; 
import CloudFilePage from "@/pages/CloudFilePage";
import FormsPage from "@/pages/FormsPage";
import FormCreatorPage from "@/pages/FormCreatorPage";
import FormSubmissionPage from "@/pages/FormSubmissionPage";
import OAuth from "@/pages/OAuth";
import DocsPage from "@/pages/DocsPage";
import AIPage from "@/pages/AIPage"; // Importation de la nouvelle page AI
import { toast } from "@/hooks/use-toast";
import { AuthProvider } from "@/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/news" element={<NewsListingPage />} />
          <Route path="/news/:id" element={<NewsArticlePage />} />
          <Route path="/cloud" element={<CloudPage />} />
          <Route path="/cloud/file/:id" element={<CloudFilePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/create" element={<FormCreatorPage />} />
          <Route path="/form/:id" element={<FormSubmissionPage />} />
          <Route path="/oauth" element={<OAuth />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/ai-studio" element={<AIPage />} /> {/* Nouvelle route vers LuvviX AI */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
