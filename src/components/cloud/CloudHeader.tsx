
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu,
  ChevronRight,
  Search,
  Grid,
  List,
  SunMoon,
  CloudCog,
  Upload,
  FolderPlus
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface CloudHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const CloudHeader: FC<CloudHeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <div className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="flex md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="hidden md:flex items-center text-sm text-gray-700 dark:text-gray-300">
            <CloudCog className="h-5 w-5 mr-2 text-purple-500" />
            <span className="font-semibold">LuvviX Cloud</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>My Files</span>
          </div>
          
          {isMobile && (
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <CloudCog className="h-5 w-5 mr-2 text-purple-500" />
              LuvviX Cloud
            </h1>
          )}
        </div>

        <div className={`${isMobile ? 'hidden' : 'flex-1 max-w-md mx-4'}`}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search files..." 
              className="pl-8 pr-4 py-2 rounded-full border-gray-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 mr-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-1 text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-800 bg-white/80 dark:bg-gray-800/80"
              onClick={() => navigate('/cloud/upload')}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-1 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80"
              onClick={() => navigate('/cloud/new-folder')}
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="text-gray-600 dark:text-gray-300"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <SunMoon className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
            <Grid className="h-5 w-5" />
          </Button>
          
          {!isMobile && (
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <List className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {isMobile && (
        <div className="mt-2 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search files..." 
              className="pl-10 pr-4 py-3 rounded-full border-gray-200 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm w-full focus:border-purple-500 focus:ring-purple-500 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex justify-between mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-800 flex-1 mr-1 justify-center bg-white/80 dark:bg-gray-800/80"
              onClick={() => navigate('/cloud/upload')}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800 flex-1 ml-1 justify-center bg-white/80 dark:bg-gray-800/80"
              onClick={() => navigate('/cloud/new-folder')}
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudHeader;
