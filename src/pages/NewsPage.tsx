
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModernNewsInterface from "@/components/news/ModernNewsInterface";
import SavedArticlesView from "@/components/news/SavedArticlesView";
import { useLanguage } from "@/hooks/useLanguage";

const NewsPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("news");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="news">Actualités IA</TabsTrigger>
              <TabsTrigger value="saved">Articles sauvés</TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <ModernNewsInterface />
            </TabsContent>

            <TabsContent value="saved">
              <SavedArticlesView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;
