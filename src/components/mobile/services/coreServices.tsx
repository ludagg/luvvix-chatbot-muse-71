
import React from 'react';
import { 
  Edit, 
  Calculator, 
  Image, 
  FileText, 
  Music, 
  Phone, 
  Video, 
  Mic, 
  Clock, 
  Flashlight, 
  QrCode, 
  FolderOpen, 
  Map, 
  Globe, 
  Users, 
  Cloud, 
  Calendar, 
  FileText as FileTextIcon 
} from 'lucide-react';
import { Service } from './types';

// Import core app components
import MobileNotes from '../apps/MobileNotes';
import MobileCalculator from '../apps/MobileCalculator';
import MobilePhotos from '../apps/MobilePhotos';
import MobileTasks from '../apps/MobileTasks';
import MobileMusic from '../apps/MobileMusic';
import MobileContacts from '../apps/MobileContacts';
import MobileVideoCall from '../apps/MobileVideoCall';
import MobileVoiceRecorder from '../apps/MobileVoiceRecorder';
import MobileTimer from '../apps/MobileTimer';
import MobileFlashlight from '../apps/MobileFlashlight';
import MobileQRScanner from '../apps/MobileQRScanner';
import MobileFileManager from '../apps/MobileFileManager';
import MobileMap from '../apps/MobileMap';
import MobileBrowser from '../apps/MobileBrowser';

export const coreServices: Service[] = [
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
    badge: 'Nouveau',
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
  }
];

export const luvvixServices: Service[] = [
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
    icon: <FileTextIcon className="w-8 h-8" />,
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
  }
];
