import { Service } from './types';

export const defaultServices: Service[] = [
  {
    id: 'ai-assistant',
    name: 'Assistant IA',
    description: 'Votre assistant personnel basé sur l\'IA',
    icon: '🤖',
    category: 'ai',
    color: 'from-blue-500 to-purple-500',
    featured: true,
    tags: ['ai', 'assistant', 'personnel']
  },
  {
    id: 'calendar',
    name: 'Calendrier',
    description: 'Gérez votre emploi du temps quotidien',
    icon: '📅',
    category: 'productivity',
    color: 'from-green-500 to-teal-500',
    featured: true,
    tags: ['calendrier', 'agenda', 'planification']
  },
  {
    id: 'forms',
    name: 'Formulaires',
    description: 'Créez et gérez vos formulaires personnalisés',
    icon: '📝',
    category: 'productivity',
    color: 'from-yellow-500 to-orange-500',
    featured: false,
    tags: ['formulaires', 'enquêtes', 'collecte de données']
  },
  {
    id: 'translate',
    name: 'Traducteur',
    description: 'Traduisez instantanément du texte dans différentes langues',
    icon: '🌐',
    category: 'tools',
    color: 'from-red-500 to-pink-500',
    featured: false,
    tags: ['traduction', 'langues', 'international']
  },
  {
    id: 'weather',
    name: 'Météo',
    description: 'Consultez les prévisions météorologiques locales',
    icon: '☀️',
    category: 'utilities',
    color: 'from-sky-500 to-blue-600',
    featured: false,
    tags: ['météo', 'prévisions', 'température']
  },
  {
    id: 'center',
    name: 'Center',
    description: 'Votre réseau social personnel',
    icon: '🧑‍🤝‍🧑',
    category: 'social',
    color: 'from-violet-500 to-purple-600',
    featured: true,
    tags: ['social', 'réseau', 'amis']
  },
];

export const coreServices: Service[] = [
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Gérez vos contacts et demandes d\'amitié',
    icon: '👥',
    category: 'core',
    color: 'from-emerald-500 to-teal-600',
    featured: true,
    tags: ['social', 'communication', 'contacts']
  },
];
