
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard"; // Updated import
import NewsPage from "@/pages/NewsPage"; // Updated import
import CloudPage from "@/pages/CloudPage"; 
import CloudFilePage from "@/pages/CloudFilePage"; // This might need adjustment based on actual file location
import FormsPage from "@/pages/FormsPage";
import FormViewPage from "@/pages/FormViewPage"; // Updated import
import FormEditorPage from "@/pages/FormEditorPage"; // Updated import
import FormResponsesPage from "@/pages/FormResponsesPage"; // Added import
import FormSettingsPage from "@/pages/FormSettingsPage"; // Added import
import OAuth from "@/pages/OAuth";
import DocsPage from "@/pages/docs/DocsPage"; // Updated import path
import AIPage from "@/pages/AIPage"; // Keeping this unchanged
import { toast } from "@/hooks/use-toast";
import { AuthProvider } from "@/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Updated component name */}
          <Route path="/news" element={<NewsPage />} /> {/* Updated component name */}
          <Route path="/news/:id" element={<NewsPage />} /> {/* Updated component name, may need specific article component */}
          <Route path="/cloud" element={<CloudPage />} />
          <Route path="/cloud/file/:id" element={<CloudFilePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/create" element={<FormEditorPage />} /> {/* Updated to match available component */}
          <Route path="/forms/edit/:formId" element={<FormEditorPage />} /> {/* Added route for editing forms */}
          <Route path="/forms/settings/:formId" element={<FormSettingsPage />} /> {/* Added route for form settings */}
          <Route path="/forms/responses/:formId" element={<FormResponsesPage />} /> {/* Added route for form responses */}
          <Route path="/form/:id" element={<FormViewPage />} /> {/* Updated component name */}
          <Route path="/oauth" element={<OAuth />} />
          <Route path="/docs" element={<DocsPage />} /> {/* This should now point to the correct location */}
          <Route path="/docs/:section" element={<DocsPage />} /> {/* Added route for docs sections */}
          <Route path="/ai-studio" element={<AIPage />} /> {/* Keeping this unchanged */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
