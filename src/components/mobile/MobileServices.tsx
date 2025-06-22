import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Grid3X3, 
  Bot,
  Globe, 
  FileText, 
  Cloud, 
  Mail, 
  BarChart3, 
  Users, 
  BookOpen, 
  Code, 
  Newspaper,
  MessageCircle,
  Shield,
  Camera,
  Calendar,
  Palette,
  Zap,
  Database,
  Settings,
  Calculator,
  Music,
  Phone,
  Video,
  Mic,
  Clock,
  Flashlight,
  QrCode,
  FolderOpen,
  Map,
  Edit,
  Image,
  Heart,
  Scale,
  Dumbbell,
  ChefHat,
  Feather,
  GraduationCap,
  DollarSign,
  Megaphone,
  Briefcase,
  Smile,
  MapPin,
  Languages,
  Plane
} from 'lucide-react';

// Import all mobile app components
import MobileNotes from './apps/MobileNotes';
import MobileCalculator from './apps/MobileCalculator';
import MobilePhotos from './apps/MobilePhotos';
import MobileTasks from './apps/MobileTasks';
import MobileMusic from './apps/MobileMusic';
import MobileContacts from './apps/MobileContacts';
import MobileVideoCall from './apps/MobileVideoCall';
import MobileVoiceRecorder from './apps/MobileVoiceRecorder';
import MobileTimer from './apps/MobileTimer';
import MobileFlashlight from './apps/MobileFlashlight';
import MobileQRScanner from './apps/MobileQRScanner';
import MobileFileManager from './apps/MobileFileManager';
import MobileMap from './apps/MobileMap';
import MobileBrowser from './apps/MobileBrowser';

// Import new AI services
import MobileAIDoctor from './apps/MobileAIDoctor';
import MobileAILawyer from './apps/MobileAILawyer';
import MobileAIFitness from './apps/MobileAIFitness';
import MobileAIChef from './apps/MobileAIChef';
import MobileAIPoet from './apps/MobileAIPoet';
import MobileAIStoryWriter from './apps/MobileAIStoryWriter';
import MobileAITutor from './apps/MobileAITutor';
import MobileAIFinance from './apps/MobileAIFinance';
import MobileAIDesigner from './apps/MobileAIDesigner';
import MobileAIMarketing from './apps/MobileAIMarketing';
import MobileAICareer from './apps/MobileAICareer';
import MobileAIMentalHealth from './apps/MobileAIMentalHealth';
import MobileAITravelPlanner from './apps/MobileAITravelPlanner';
import MobileAILanguage from './apps/MobileAILanguage';

interface AppComponent {
  component: React.ComponentType<{ onBack: () => void }>;
  action?: () => void;
}

const MobileServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const services = [
    {
      id: 'luvvix-ai-studio',
      name: 'LuvviX AI Studio',
      description: 'Studio de création d\'agents IA',
      icon: <Bot className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      badge: 'Populaire',
      category: 'ai',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-assistant'))
    },
    {
      id: 'notes',
      name: 'Notes',
      description: 'Prenez des notes rapidement',
      icon: <Edit className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      category: 'productivity',
      component: MobileNotes
    },
    {
      id: 'calculator',
      name: 'Calculatrice',
      description: 'Calculatrice scientifique',
      icon: <Calculator className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
      category: 'utility',
      component: MobileCalculator
    },
    {
      id: 'photos',
      name: 'Photos',
      description: 'Gérez vos photos',
      icon: <Image className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-pink-500 to-rose-600',
      category: 'media',
      component: MobilePhotos
    },
    {
      id: 'tasks',
      name: 'Tâches',
      description: 'Gestionnaire de tâches',
      icon: <FileText className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      category: 'productivity',
      component: MobileTasks
    },
    {
      id: 'music',
      name: 'Musique',
      description: 'Lecteur de musique',
      icon: <Music className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600',
      category: 'media',
      component: MobileMusic
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Carnet d\'adresses',
      icon: <Phone className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      category: 'communication',
      component: MobileContacts
    },
    {
      id: 'video-call',
      name: 'Appel Vidéo',
      description: 'Visioconférence',
      icon: <Video className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      category: 'communication',
      component: MobileVideoCall
    },
    {
      id: 'voice-recorder',
      name: 'Enregistreur',
      description: 'Enregistrements vocaux',
      icon: <Mic className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
      category: 'utility',
      component: MobileVoiceRecorder
    },
    {
      id: 'timer',
      name: 'Minuteur',
      description: 'Timer et chronomètre',
      icon: <Clock className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      category: 'utility',
      component: MobileTimer
    },
    {
      id: 'flashlight',
      name: 'Lampe de poche',
      description: 'Lampe torche LED',
      icon: <Flashlight className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      category: 'utility',
      component: MobileFlashlight
    },
    {
      id: 'qr-scanner',
      name: 'Scanner QR',
      description: 'Lecteur de codes QR',
      icon: <QrCode className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      category: 'utility',
      component: MobileQRScanner
    },
    {
      id: 'file-manager',
      name: 'Fichiers',
      description: 'Gestionnaire de fichiers',
      icon: <FolderOpen className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
      category: 'utility',
      component: MobileFileManager
    },
    {
      id: 'maps',
      name: 'Cartes',
      description: 'Navigation GPS',
      icon: <Map className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-600 to-teal-600',
      category: 'navigation',
      component: MobileMap
    },
    {
      id: 'browser',
      name: 'Navigateur',
      description: 'Navigateur web',
      icon: <Globe className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
      category: 'internet',
      component: MobileBrowser
    },
    {
      id: 'luvvix-center',
      name: 'LuvviX Center',
      description: 'Réseau social professionnel',
      icon: <Users className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
      category: 'social',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-center'))
    },
    {
      id: 'luvvix-translate',
      name: 'LuvviX Translate',
      description: 'Traduction instantanée multilingue',
      icon: <Globe className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      category: 'productivity',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-translate'))
    },
    {
      id: 'luvvix-weather',
      name: 'LuvviX Weather',
      description: 'Prévisions météo avancées',
      icon: <Cloud className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      category: 'lifestyle',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-weather'))
    },
    {
      id: 'luvvix-forms',
      name: 'LuvviX Forms',
      description: 'Création de formulaires intelligents',
      icon: <FileText className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      category: 'productivity',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-forms'))
    },
    {
      id: 'luvvix-calendar',
      name: 'LuvviX Calendar',
      description: 'Calendrier intelligent avec IA',
      icon: <Calendar className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
      category: 'productivity',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-calendar'))
    },
    {
      id: 'ai-doctor',
      name: 'Dr. LuvviX IA',
      description: 'Conseils médicaux personnalisés',
      icon: <Heart className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIDoctor
    },
    {
      id: 'ai-lawyer',
      name: 'Avocat IA',
      description: 'Conseils juridiques intelligents',
      icon: <Scale className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAILawyer
    },
    {
      id: 'ai-fitness',
      name: 'Coach Fitness IA',
      description: 'Programme sport personnalisé',
      icon: <Dumbbell className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIFitness
    },
    {
      id: 'ai-chef',
      name: 'Chef IA',
      description: 'Recettes créatives personnalisées',
      icon: <ChefHat className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIChef
    },
    {
      id: 'ai-poet',
      name: 'Poète IA',
      description: 'Création de poèmes originaux',
      icon: <Feather className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIPoet
    },
    {
      id: 'ai-story-writer',
      name: 'Écrivain IA',
      description: 'Histoires captivantes sur mesure',
      icon: <BookOpen className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIStoryWriter
    },
    {
      id: 'ai-tutor',
      name: 'Tuteur IA',
      description: 'Apprentissage personnalisé',
      icon: <GraduationCap className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAITutor
    },
    {
      id: 'ai-finance',
      name: 'Conseiller Finance IA',
      description: 'Gestion financière intelligente',
      icon: <DollarSign className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIFinance
    },
    {
      id: 'ai-designer',
      name: 'Designer IA',
      description: 'Concepts créatifs innovants',
      icon: <Palette className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-pink-500 to-purple-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIDesigner
    },
    {
      id: 'ai-marketing',
      name: 'Marketing IA',
      description: 'Stratégies marketing optimisées',
      icon: <Megaphone className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIMarketing
    },
    {
      id: 'ai-career',
      name: 'Conseiller Carrière IA',
      description: 'Plan de carrière personnalisé',
      icon: <Briefcase className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAICareer
    },
    {
      id: 'ai-mental-health',
      name: 'Bien-être Mental IA',
      description: 'Soutien psychologique intelligent',
      icon: <Smile className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAIMentalHealth
    },
    {
      id: 'ai-travel-planner',
      name: 'Planificateur Voyage IA',
      description: 'Itinéraires de voyage optimisés',
      icon: <Plane className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAITravelPlanner
    },
    {
      id: 'ai-language',
      name: 'Professeur Langues IA',
      description: 'Apprentissage linguistique adaptatif',
      icon: <Languages className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-yellow-600',
      badge: 'Nouveau',
      category: 'ai',
      component: MobileAILanguage
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'ai', label: 'IA', icon: <Bot className="w-4 h-4" /> },
    { id: 'productivity', label: 'Productivité', icon: <Zap className="w-4 h-4" /> },
    { id: 'communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'media', label: 'Média', icon: <Camera className="w-4 h-4" /> },
    { id: 'utility', label: 'Utilitaires', icon: <Settings className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'navigation', label: 'Navigation', icon: <Map className="w-4 h-4" /> },
    { id: 'internet', label: 'Internet', icon: <Globe className="w-4 h-4" /> },
    { id: 'lifestyle', label: 'Style de vie', icon: <Palette className="w-4 h-4" /> }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || service.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.component) {
      setActiveApp(service.id);
    } else if (service.action) {
      service.action();
    } else {
      toast({
        title: service.name,
        description: `Ouverture de ${service.description}`,
      });
    }
  };

  const handleBackFromApp = () => {
    setActiveApp(null);
  };

  // Render active app
  if (activeApp) {
    const service = services.find(s => s.id === activeApp);
    if (service?.component) {
      const AppComponent = service.component as React.ComponentType<{ onBack: () => void }>;
      return <AppComponent onBack={handleBackFromApp} />;
    }
  }

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      <div className="bg-white">
        {/* Header */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Services LuvviX</h1>
          
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Onglets de catégories */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des services */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform text-left relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-3 text-white shadow-lg`}>
                  {service.icon}
                </div>
                
                {service.badge && (
                  <div className="absolute top-0 right-0">
                    <span className={`text-white text-xs px-2 py-1 rounded-full ${
                      service.badge === 'Nouveau' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {service.badge}
                    </span>
                  </div>
                )}
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600">Essayez avec d'autres mots-clés</p>
          </div>
        )}
      </div>

      {/* Section des statistiques */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Écosystème LuvviX</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-purple-100">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-purple-100">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-purple-100">Possibilités</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileServices;
