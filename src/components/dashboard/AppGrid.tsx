
import { useState, useMemo } from "react";
import AppIcon from "./AppIcon";
import SearchBar from "./SearchBar";
import { Brain, FileText, Newspaper, CloudSun, Settings, User, ShieldCheck, Cloud, Bot, Sparkles } from "lucide-react";

interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;  // Using any here for the icon component
  to: string;
  color: string;
  keywords: string[];
}

const apps: AppDefinition[] = [
  {
    id: "ai-studio",
    name: "LuvviX AI Studio",
    description: "Création d'agents IA",
    icon: Bot,
    to: "/ai-studio",
    color: "bg-violet-500",
    keywords: ["ia", "intelligence", "artificielle", "ai", "assistant", "chatbot", "studio", "agent"]
  },
  {
    id: "ai",
    name: "LuvviX AI",
    description: "Intelligence artificielle avancée",
    icon: Brain,
    to: "/ai",
    color: "bg-blue-500",
    keywords: ["ia", "intelligence", "artificielle", "ai", "assistant", "chatbot"]
  },
  {
    id: "forms",
    name: "LuvviX Forms",
    description: "Création de formulaires",
    icon: FileText,
    to: "/forms",
    color: "bg-purple-500",
    keywords: ["forms", "formulaires", "sondages", "questionnaires"]
  },
  {
    id: "news",
    name: "LuvviX News",
    description: "Actualités personnalisées",
    icon: Newspaper,
    to: "/news",
    color: "bg-orange-500",
    keywords: ["news", "actualités", "informations"]
  },
  {
    id: "weather",
    name: "LuvviX Météo",
    description: "Prévisions météorologiques",
    icon: CloudSun,
    to: "/weather",
    color: "bg-sky-500",
    keywords: ["meteo", "météo", "temps", "prévisions"]
  },
  {
    id: "streammix",
    name: "LuvviX StreamMix",
    description: "Streaming multimédia",
    icon: Cloud,
    to: "/streammix",
    color: "bg-red-500",
    keywords: ["stream", "streaming", "vidéo", "media", "multimédia"]
  },
  {
    id: "medic",
    name: "LuvviX Medic",
    description: "Solutions de santé",
    icon: ShieldCheck,
    to: "/medecine",
    color: "bg-emerald-500",
    keywords: ["santé", "médecine", "health", "medic", "medical"]
  },
  {
    id: "cloud",
    name: "LuvviX Cloud",
    description: "Stockage et partage de fichiers",
    icon: Cloud,
    to: "/cloud",
    color: "bg-indigo-500",
    keywords: ["cloud", "stockage", "files", "fichiers"]
  },
  {
    id: "settings",
    name: "Paramètres",
    description: "Gérer votre compte",
    icon: Settings,
    to: "/dashboard?tab=security",
    color: "bg-gray-500",
    keywords: ["settings", "paramètres", "configuration", "préférences"]
  },
  {
    id: "profile",
    name: "Profil",
    description: "Gérer votre profil",
    icon: User,
    to: "/dashboard?tab=profile",
    color: "bg-teal-500",
    keywords: ["profile", "profil", "compte", "utilisateur"]
  }
];

const AppGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return apps.filter(app => {
      return (
        app.name.toLowerCase().includes(normalizedQuery) ||
        app.description.toLowerCase().includes(normalizedQuery) ||
        app.keywords.some(keyword => keyword.includes(normalizedQuery))
      );
    });
  }, [searchQuery]);
  
  return (
    <div>
      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      
      {filteredApps.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune application trouvée pour "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredApps.map(app => (
            <AppIcon
              key={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              to={app.to}
              color={app.color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppGrid;
