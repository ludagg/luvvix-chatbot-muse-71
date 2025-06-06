
import { Brain, BookOpen, Target, BarChart3, Trophy, Award } from "lucide-react";

interface LearningMobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LearningMobileNav = ({ activeTab, setActiveTab }: LearningMobileNavProps) => {
  const navItems = [
    { id: "dashboard", label: "Accueil", icon: Target },
    { id: "courses", label: "Cours", icon: BookOpen },
    { id: "progress", label: "Stats", icon: BarChart3 },
    { id: "completed", label: "Diplômes", icon: Award },
    { id: "ai-assistant", label: "IA", icon: Brain },
    { id: "generator", label: "Créer", icon: Trophy },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningMobileNav;
