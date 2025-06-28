
import React from 'react';
import { 
  Mail, 
  Calendar, 
  FileText, 
  Cloud, 
  BookOpen, 
  Search,
  Settings,
  BarChart3,
  MessageSquare,
  Users,
  Zap,
  Shield,
  Palette,
  Globe,
  Camera,
  Music,
  Heart,
  Brain
} from 'lucide-react';
import { Service } from './types';

// Import existing mobile components
import MobileCalendar from '../MobileCalendar';
import MobileForms from '../MobileForms';
import MobileCloud from '../MobileCloud';
import MobileSearch from '../MobileSearch';
import MobileSettings from '../MobileSettings';
import MobileCenter from '../MobileCenter';
import MobileTranslate from '../MobileTranslate';
import MobileWeather from '../MobileWeather';

// Import new cognitive interface
import CognitiveInterface from '../CognitiveInterface';

export const coreServices: Service[] = [
  {
    id: 'mail',
    name: 'LuvviX Mail',
    description: 'Gestion intelligente des emails',
    icon: <Mail className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    badge: 'Core',
    category: 'communication',
    action: () => console.log('Mail app - Coming soon')
  },
  {
    id: 'calendar',
    name: 'LuvviX Calendar',
    description: 'Planification et gestion du temps',
    icon: <Calendar className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
    badge: 'Core',
    category: 'productivity',
    component: MobileCalendar
  },
  {
    id: 'forms',
    name: 'LuvviX Forms',
    description: 'Création de formulaires intelligents',
    icon: <FileText className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
    badge: 'Core',
    category: 'productivity',
    component: MobileForms
  },
  {
    id: 'cloud',
    name: 'LuvviX Cloud',
    description: 'Stockage et synchronisation',
    icon: <Cloud className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-sky-500 to-blue-600',
    badge: 'Core',
    category: 'utility',
    component: MobileCloud
  },
  {
    id: 'learn',
    name: 'LuvviX Learn',
    description: 'Plateforme d\'apprentissage IA',
    icon: <BookOpen className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
    badge: 'Core',
    category: 'productivity',
    action: () => window.dispatchEvent(new CustomEvent('navigate-to-learn'))
  },
  {
    id: 'search',
    name: 'LuvviX Search',
    description: 'Recherche intelligente unifiée',
    icon: <Search className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-gray-500 to-slate-600',
    badge: 'Core',
    category: 'utility',
    component: MobileSearch
  }
];

export const luvvixServices: Service[] = [
  {
    id: 'cognitive-interface',
    name: 'Interface Cognitive',
    description: 'Votre IA personnelle avancée',
    icon: <Brain className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600',
    badge: 'Révolutionnaire',
    category: 'ai',
    component: CognitiveInterface
  },
  {
    id: 'settings',
    name: 'Paramètres',
    description: 'Configuration système',
    icon: <Settings className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
    category: 'utility',
    component: MobileSettings
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analyse de performance',
    icon: <BarChart3 className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    category: 'utility',
    action: () => console.log('Analytics - Coming soon')
  },
  {
    id: 'center',
    name: 'LuvviX Center',
    description: 'Réseau social intelligent',
    icon: <Users className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-pink-500 to-rose-600',
    badge: 'Social',
    category: 'social',
    component: MobileCenter
  },
  {
    id: 'translate',
    name: 'LuvviX Translate',
    description: 'Traduction intelligente',
    icon: <Globe className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    category: 'utility',
    component: MobileTranslate
  },
  {
    id: 'weather',
    name: 'LuvviX Weather',
    description: 'Météo et prévisions',
    icon: <Cloud className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    category: 'lifestyle',
    component: MobileWeather
  },
  {
    id: 'automation',
    name: 'Orchestrateur',
    description: 'Automatisation intelligente',
    icon: <Zap className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    badge: 'Révolutionnaire',
    category: 'productivity',
    action: () => console.log('Orchestrator - Coming soon')
  },
  {
    id: 'security',
    name: 'Sécurité',
    description: 'Protection avancée',
    icon: <Shield className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
    category: 'utility',
    action: () => console.log('Security - Coming soon')
  },
  {
    id: 'design',
    name: 'Design Studio',
    description: 'Outils créatifs IA',
    icon: <Palette className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
    category: 'media',
    action: () => console.log('Design Studio - Coming soon')
  },
  {
    id: 'media',
    name: 'Media Hub',
    description: 'Gestion multimédia',
    icon: <Camera className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-emerald-500 to-green-600',
    category: 'media',
    action: () => console.log('Media Hub - Coming soon')
  },
  {
    id: 'music',
    name: 'Music AI',
    description: 'Création musicale IA',
    icon: <Music className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-pink-500 to-purple-600',
    category: 'media',
    action: () => console.log('Music AI - Coming soon')
  },
  {
    id: 'health',
    name: 'Health Monitor',
    description: 'Suivi santé intelligent',
    icon: <Heart className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-red-400 to-pink-500',
    category: 'lifestyle',
    action: () => console.log('Health Monitor - Coming soon')
  }
];
