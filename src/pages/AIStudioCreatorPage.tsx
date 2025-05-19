
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatorProfile from "@/components/ai-studio/CreatorProfile";
import { TooltipProvider } from "@/components/ui/tooltip";

const AIStudioCreatorPage = () => {
  document.title = "Profil de créateur - LuvviX AI Studio";

  return (
    <TooltipProvider>
      <div className="pt-24 flex-1">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
            <CreatorProfile />
          </main>
          
          <Footer />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIStudioCreatorPage;
