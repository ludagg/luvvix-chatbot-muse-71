
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  BookOpen, 
  Brain, 
  Trophy, 
  User,
  Target
} from "lucide-react";

interface LearningMobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LearningMobileNav = ({ activeTab, setActiveTab }: LearningMobileNavProps) => {
  const navItems = [
    { 
      id: 'dashboard', 
      icon: Target, 
      label: 'Tableau de bord',
      color: 'text-purple-600'
    },
    { 
      id: 'courses', 
      icon: BookOpen, 
      label: 'Cours',
      color: 'text-blue-600'
    },
    { 
      id: 'ai-assistant', 
      icon: Brain, 
      label: 'Assistant IA',
      color: 'text-green-600',
      badge: 'AI'
    },
    { 
      id: 'generator', 
      icon: Trophy, 
      label: 'Générateur',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`relative flex flex-col items-center p-2 h-auto min-w-0 ${
                isActive 
                  ? `${item.color} bg-gray-100 dark:bg-gray-800` 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs leading-none">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningMobileNav;
