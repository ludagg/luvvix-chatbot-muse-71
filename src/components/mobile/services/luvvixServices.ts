
import React from 'react';
import { MessageCircle, Users, Phone, Video, Settings, Search, UserPlus } from 'lucide-react';
import { Service } from './types';
import MobileMessengerLuvvix from '../MobileMessengerLuvvix';

export const luvvixServices: Service[] = [
  {
    id: 'messenger-luvvix',
    name: 'Messenger LuvviX',
    description: 'Messagerie complète avec chat, groupes, appels et médias',
    icon: React.createElement(MessageCircle),
    bgColor: 'from-blue-500 to-purple-600',
    badge: 'Nouveau',
    category: 'communication',
    component: MobileMessengerLuvvix
  },
  {
    id: 'video-calls',
    name: 'Appels Vidéo',
    description: 'Appels vidéo haute qualité avec partage d\'écran',
    icon: React.createElement(Video),
    bgColor: 'from-green-500 to-teal-600',
    category: 'communication'
  },
  {
    id: 'voice-calls', 
    name: 'Appels Vocaux',
    description: 'Appels vocaux crystal clear avec suppression de bruit',
    icon: React.createElement(Phone),
    bgColor: 'from-orange-500 to-red-600',
    category: 'communication'
  },
  {
    id: 'group-management',
    name: 'Gestion Groupes',
    description: 'Créez et gérez vos groupes de discussion',
    icon: React.createElement(Users),
    bgColor: 'from-purple-500 to-pink-600',
    category: 'communication'
  },
  {
    id: 'user-search',
    name: 'Recherche Utilisateurs',
    description: 'Trouvez et connectez-vous avec d\'autres utilisateurs',
    icon: React.createElement(Search),
    bgColor: 'from-indigo-500 to-blue-600',
    category: 'social'
  },
  {
    id: 'add-friends',
    name: 'Ajouter Amis',
    description: 'Ajoutez des amis et développez votre réseau',
    icon: React.createElement(UserPlus),
    bgColor: 'from-cyan-500 to-blue-600',
    category: 'social'
  },
  {
    id: 'messenger-settings',
    name: 'Paramètres Messenger',
    description: 'Personnalisez votre expérience de messagerie',
    icon: React.createElement(Settings),
    bgColor: 'from-gray-500 to-slate-600',
    category: 'settings'
  }
];
