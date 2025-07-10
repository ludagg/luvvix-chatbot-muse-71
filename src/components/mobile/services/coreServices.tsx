
import React from 'react';
import { Bot, Calendar, Users } from 'lucide-react';
import { Service } from './types';

export const defaultServices: Service[] = [
  {
    id: 'ai-assistant',
    name: 'Assistant IA',
    description: 'Votre assistant personnel basé sur l\'IA',
    icon: <Bot className="w-8 h-8" />,
    category: 'ai',
    bgColor: 'bg-gradient-to-br from-blue-500 to-purple-500',
    featured: true,
    tags: ['ai', 'assistant', 'personnel']
  },
  {
    id: 'calendar',
    name: 'Calendrier',
    description: 'Gérez votre emploi du temps quotidien',
    icon: <Calendar className="w-8 h-8" />,
    category: 'productivity',
    bgColor: 'bg-gradient-to-br from-green-500 to-teal-500',
    featured: true,
    tags: ['calendrier', 'agenda', 'planification']
  },
  {
    id: 'forms',
    name: 'Formulaires',
    description: 'Créez et gérez vos formulaires personnalisés',
    icon: <Bot className="w-8 h-8" />,
    category: 'productivity',
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    featured: false,
    tags: ['formulaires', 'enquêtes', 'collecte de données']
  },
  {
    id: 'translate',
    name: 'Traducteur',
    description: 'Traduisez instantanément du texte dans différentes langues',
    icon: <Bot className="w-8 h-8" />,
    category: 'tools',
    bgColor: 'bg-gradient-to-br from-red-500 to-pink-500',
    featured: false,
    tags: ['traduction', 'langues', 'international']
  },
  {
    id: 'weather',
    name: 'Météo',
    description: 'Consultez les prévisions météorologiques locales',
    icon: <Bot className="w-8 h-8" />,
    category: 'utilities',
    bgColor: 'bg-gradient-to-br from-sky-500 to-blue-600',
    featured: false,
    tags: ['météo', 'prévisions', 'température']
  },
  {
    id: 'center',
    name: 'Center',
    description: 'Votre réseau social personnel',
    icon: <Users className="w-8 h-8" />,
    category: 'social',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
    featured: true,
    tags: ['social', 'réseau', 'amis']
  },
];

export const coreServices: Service[] = [
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Gérez vos contacts et demandes d\'amitié',
    icon: <Users className="w-8 h-8" />,
    category: 'core',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    featured: true,
    tags: ['social', 'communication', 'contacts']
  },
];
