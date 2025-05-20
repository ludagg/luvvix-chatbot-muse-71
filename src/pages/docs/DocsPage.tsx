
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DocsSidebar from '@/components/docs/DocsSidebar';
import { Button } from '@/components/ui/button';
import { Menu, Search, X } from 'lucide-react';

// These would typically come from a CMS or API, but for now we'll hardcode them
import AIStudioDocs from '@/components/docs/content/AIStudioDocs';
import FormsDocs from '@/components/docs/content/FormsDocs';
import IDDocs from '@/components/docs/content/IDDocs';
import GettingStartedDocs from '@/components/docs/content/GettingStartedDocs';

const DocsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDoc, setCurrentDoc] = useState('getting-started');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the current documentation section from the URL
  useEffect(() => {
    const path = location.pathname.split('/');
    if (path.length > 2) {
      setCurrentDoc(path[2]);
    } else {
      setCurrentDoc('getting-started');
    }
  }, [location]);
  
  // Handle searching
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };
  
  // Render the appropriate documentation content based on the current section
  const renderDocContent = () => {
    switch(currentDoc) {
      case 'ai-studio':
        return <AIStudioDocs />;
      case 'forms':
        return <FormsDocs />;
      case 'id':
        return <IDDocs />;
      case 'getting-started':
      default:
        return <GettingStartedDocs />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Documentation | LuvviX</title>
        <meta name="description" content="Documentation et guides d'utilisation des produits LuvviX" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex pt-20">
          {/* Mobile sidebar toggle button */}
          <div className="lg:hidden fixed bottom-6 left-6 z-40">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size="icon"
              className="rounded-full shadow-lg bg-violet-600 hover:bg-violet-700 text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
          
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 transform z-30 w-80 bg-white dark:bg-gray-900 shadow-lg 
            transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <DocsSidebar
              currentDoc={currentDoc}
              onSelectDoc={(doc) => {
                navigate(`/docs/${doc}`);
                setSidebarOpen(false);
              }}
            />
          </div>
          
          {/* Main content */}
          <div className="flex-1 pl-0 lg:pl-80 pt-4 pb-16 px-4 md:px-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {/* Search bar */}
              <div className="mb-8 sticky top-[80px] bg-white dark:bg-gray-900 pt-4 pb-2 z-10">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher dans la documentation..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </form>
              </div>
              
              {/* Documentation content */}
              <div className="pb-16">
                {renderDocContent()}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default DocsPage;
