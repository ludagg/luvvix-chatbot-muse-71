import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import OAuth from "@/pages/OAuth";
import OAuthTest from "@/pages/OAuthTest";
import WeatherPage from "@/pages/WeatherPage";
import NewsPage from "@/pages/NewsPage";
import AdminPanel from "@/pages/AdminPanel";
import ApiDocs from "@/pages/ApiDocs";
import CloudPage from "@/pages/CloudPage";
import NotFound from "@/pages/NotFound";
import FormsPage from "@/pages/FormsPage";
import FormEditorPage from "@/pages/FormEditorPage";
import FormResponsesPage from "@/pages/FormResponsesPage";
import FormSettingsPage from "@/pages/FormSettingsPage";
import FormViewPage from "@/pages/FormViewPage";
import AIStudioPage from "@/pages/AIStudioPage";
import AIStudioAdminPage from "@/pages/AIStudioAdminPage";
import AIStudioDashboardPage from "@/pages/AIStudioDashboardPage";
import AIStudioCreateAgentPage from "@/pages/AIStudioCreateAgentPage";
import AIStudioEditAgentPage from "@/pages/AIStudioEditAgentPage";
import AIStudioChatPage from "@/pages/AIStudioChatPage";
import AIStudioMarketplacePage from "@/pages/AIStudioMarketplacePage";
import AIStudioAgentPage from "@/pages/AIStudioAgentPage";
import AIStudioCreatorPage from "@/pages/AIStudioCreatorPage";

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/oauth" element={<OAuth />} />
        <Route path="/oauth-test" element={<OAuthTest />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/cloud" element={<CloudPage />} />
        
        {/* Forms routes */}
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/:formId" element={<FormEditorPage />} />
        <Route path="/forms/:formId/edit" element={<FormEditorPage />} />
        <Route path="/forms/:formId/responses" element={<FormResponsesPage />} />
        <Route path="/forms/:formId/settings" element={<FormSettingsPage />} />
        <Route path="/forms/:formId/view" element={<FormViewPage />} />
        
        {/* AI Studio routes */}
        <Route path="/ai-studio" element={<AIStudioPage />} />
        <Route path="/ai-studio/admin" element={<AIStudioAdminPage />} />
        <Route path="/ai-studio/dashboard" element={<AIStudioDashboardPage />} />
        <Route path="/ai-studio/create" element={<AIStudioCreateAgentPage />} />
        <Route path="/ai-studio/edit/:agentId" element={<AIStudioEditAgentPage />} />
        <Route path="/ai-studio/chat/:agentId" element={<AIStudioChatPage />} />
        <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
        <Route path="/ai-studio/agents/:agentId" element={<AIStudioAgentPage />} />
        <Route path="/ai-studio/creators/:creatorId" element={<AIStudioCreatorPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <div
        className="custom-cursor"
        style={{
          left: mousePosition.x + "px",
          top: mousePosition.y + "px",
        }}
      />
    </BrowserRouter>
  );
}

export default App;
