import React from 'react';
import { Calendar, ListChecks, Cloud, Book, Newspaper, Sun, Translate, Brain, Code, Map, Mail } from 'lucide-react';
import { Service } from './types';
import MobileCalendar from '../MobileCalendar';
import MobileForms from '../MobileForms';
import MobileCloud from '../MobileCloud';
import LuvviXLearn from '../LuvviXLearn';
import MobileNews from '../MobileNews';
import MobileWeather from '../MobileWeather';
import MobileTranslate from '../MobileTranslate';
import MobileMindMap from '../MobileMindMap';
import MobileCodeStudio from '../MobileCodeStudio';
import MobileMail from '../MobileMail';

import { luvvixServices } from './luvvixServices';

// Exporter les services LuvviX séparément et les combiner
export { luvvixServices };
export const coreServices: Service[] = [
  {
    id: 'calendar',
    name: 'Calendrier',
    description: 'Gérez vos événements et rappels',
    icon: React.createElement(Calendar),
    bgColor: 'from-red-500 to-pink-600',
    category: 'productivity',
    component: MobileCalendar
  },
  {
    id: 'forms',
    name: 'Formulaires',
    description: 'Créez et gérez vos formulaires',
    icon: React.createElement(ListChecks),
    bgColor: 'from-orange-500 to-yellow-600',
    category: 'productivity',
    component: MobileForms
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Stockez et partagez vos fichiers',
    icon: React.createElement(Cloud),
    bgColor: 'from-green-500 to-teal-600',
    category: 'productivity',
    component: MobileCloud
  },
  {
    id: 'luvvix-learn',
    name: 'LuvviX Learn',
    description: 'Apprenez de nouvelles compétences',
    icon: React.createElement(Book),
    bgColor: 'from-blue-500 to-purple-600',
    category: 'productivity',
    component: LuvviXLearn
  },
  {
    id: 'news',
    name: 'Actualités',
    description: 'Restez informé des dernières actualités',
    icon: React.createElement(Newspaper),
    bgColor: 'from-indigo-500 to-violet-600',
    category: 'mobile',
    component: MobileNews
  },
  {
    id: 'weather',
    name: 'Météo',
    description: 'Consultez les prévisions météorologiques',
    icon: React.createElement(Sun),
    bgColor: 'from-yellow-500 to-orange-600',
    category: 'mobile',
    component: MobileWeather
  },
  {
    id: 'translate',
    name: 'Traducteur',
    description: 'Traduisez du texte dans différentes langues',
    icon: React.createElement(Translate),
    bgColor: 'from-teal-500 to-green-600',
    category: 'mobile',
    component: MobileTranslate
  },
  {
    id: 'mindmap',
    name: 'MindMap',
    description: 'Créez des cartes mentales',
    icon: React.createElement(Brain),
    bgColor: 'from-fuchsia-500 to-pink-600',
    category: 'productivity',
    component: MobileMindMap
  },
  {
    id: 'code-studio',
    name: 'Code Studio',
    description: 'Écrivez et testez du code',
    icon: React.createElement(Code),
    bgColor: 'from-gray-500 to-blue-600',
    category: 'productivity',
    component: MobileCodeStudio
  },
  {
    id: 'mail',
    name: 'Mail',
    description: 'Accédez à votre boîte mail',
    icon: React.createElement(Mail),
    bgColor: 'from-purple-500 to-indigo-600',
    category: 'productivity',
    component: MobileMail
  }
];
