
import React from 'react';
import { 
  Bot, 
  Mic, 
  Edit, 
  Key, 
  CheckCircle, 
  Send, 
  FileUser, 
  PieChart, 
  Heart, 
  Scale, 
  Dumbbell, 
  ChefHat, 
  Feather, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  Palette, 
  Megaphone, 
  Briefcase, 
  Smile, 
  Plane, 
  Languages 
} from 'lucide-react';
import { Service } from './types';

// Import AI services
import MobileAITranscriber from '../apps/MobileAITranscriber';
import MobileAIPhotoEditor from '../apps/MobileAIPhotoEditor';
import MobileAIPasswordManager from '../apps/MobileAIPasswordManager';
import MobileAICodeReviewer from '../apps/MobileAICodeReviewer';
import MobileAIEmailAssistant from '../apps/MobileAIEmailAssistant';
import MobileAIResumeBuilder from '../apps/MobileAIResumeBuilder';
import MobileAIBudgetPlanner from '../apps/MobileAIBudgetPlanner';
import MobileAIDoctor from '../apps/MobileAIDoctor';
import MobileAILawyer from '../apps/MobileAILawyer';
import MobileAIFitness from '../apps/MobileAIFitness';
import MobileAIChef from '../apps/MobileAIChef';
import MobileAIPoet from '../apps/MobileAIPoet';
import MobileAIStoryWriter from '../apps/MobileAIStoryWriter';
import MobileAITutor from '../apps/MobileAITutor';
import MobileAIFinance from '../apps/MobileAIFinance';
import MobileAIDesigner from '../apps/MobileAIDesigner';
import MobileAIMarketing from '../apps/MobileAIMarketing';
import MobileAICareer from '../apps/MobileAICareer';
import MobileAIMentalHealth from '../apps/MobileAIMentalHealth';
import MobileAITravelPlanner from '../apps/MobileAITravelPlanner';
import MobileAILanguage from '../apps/MobileAILanguage';

export const aiServices: Service[] = [
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
    id: 'ai-transcriber',
    name: 'Transcripteur IA',
    description: 'Conversion audio vers texte intelligente',
    icon: <Mic className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAITranscriber
  },
  {
    id: 'ai-photo-editor',
    name: 'Éditeur Photo IA',
    description: 'Édition d\'images avec intelligence artificielle',
    icon: <Edit className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-pink-500 to-purple-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAIPhotoEditor
  },
  {
    id: 'ai-password-manager',
    name: 'Gestionnaire Mots de Passe IA',
    description: 'Génération de mots de passe sécurisés',
    icon: <Key className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-green-500 to-blue-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAIPasswordManager
  },
  {
    id: 'ai-code-reviewer',
    name: 'Réviseur Code IA',
    description: 'Analyse et amélioration de code',
    icon: <CheckCircle className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-slate-500 to-gray-700',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAICodeReviewer
  },
  {
    id: 'ai-email-assistant',
    name: 'Assistant Email IA',
    description: 'Rédaction d\'emails professionnels',
    icon: <Send className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAIEmailAssistant
  },
  {
    id: 'ai-resume-builder',
    name: 'Créateur CV IA',
    description: 'Génération de CV personnalisés',
    icon: <FileUser className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-emerald-500 to-green-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAIResumeBuilder
  },
  {
    id: 'ai-budget-planner',
    name: 'Planificateur Budget IA',
    description: 'Gestion financière intelligente',
    icon: <PieChart className="w-8 h-8" />,
    bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    badge: 'Nouveau',
    category: 'ai',
    component: MobileAIBudgetPlanner
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
