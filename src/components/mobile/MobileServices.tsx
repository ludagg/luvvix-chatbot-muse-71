
import React, { useState } from 'react';
import { Calendar, ListChecks, Languages, Sun, Bot, Phone, Mail, Users, Book, LayoutDashboard } from 'lucide-react';
import MobileAssistant from './MobileAssistant';
import MobileCalendar from './MobileCalendar';
import MobileForms from './MobileForms';
import MobileTranslate from './MobileTranslate';
import MobileWeather from './MobileWeather';
import MobileContacts from './apps/MobileContacts';
import MobileCenter from './MobileCenter';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  category: string;
  color: string;
  featured: boolean;
  tags: string[];
}

const MobileServices = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const handleServiceClick = (service: Service) => {
    console.log('Service clicked:', service.name);
    
    // Navigation spécifique pour chaque service
    switch (service.id) {
      case 'ai-assistant':
        window.dispatchEvent(new CustomEvent('navigate-to-assistant'));
        break;
      case 'calendar':
        window.dispatchEvent(new CustomEvent('navigate-to-calendar'));
        break;
      case 'forms':
        window.dispatchEvent(new CustomEvent('navigate-to-forms'));
        break;
      case 'translate':
        window.dispatchEvent(new CustomEvent('navigate-to-translate'));
        break;
      case 'weather':
        window.dispatchEvent(new CustomEvent('navigate-to-weather'));
        break;
      case 'center':
        window.dispatchEvent(new CustomEvent('navigate-to-center'));
        break;
      case 'contacts':
        // Nouveau service contacts
        setActiveApp('contacts');
        break;
      default:
        // Pour les autres services, utiliser l'ancien système
        setActiveApp(service.id);
        break;
    }
  };

  const renderServiceGrid = (services: Service[]) => (
    <div className="grid grid-cols-2 gap-4 p-4">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => handleServiceClick(service)}
          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition-colors hover:shadow-lg ${service.color} text-white`}
        >
          <div className="text-3xl mb-2">
            {service.icon}
          </div>
          <div className="text-center font-semibold">{service.name}</div>
          <div className="text-sm text-gray-100">{service.description}</div>
        </button>
      ))}
    </div>
  );

  const renderCategoryTabs = (categories: string[], services: Service[]) => {
    const categorizedServices = categories.map(category => ({
      category,
      services: services.filter(service => service.category === category)
    }));

    return (
      <div className="space-y-4">
        {categorizedServices.map(({ category, services }) => (
          <div key={category}>
            <h2 className="text-xl font-bold px-4 py-2 capitalize">{category}</h2>
            {renderServiceGrid(services)}
          </div>
        ))}
      </div>
    );
  };

  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900">Services</h1>
      <p className="text-gray-600">Découvrez nos services intégrés</p>
    </div>
  );

  const renderActiveApp = () => {
    if (!activeApp) return null;

    const appComponents: Record<string, React.ComponentType<{ onBack: () => void }>> = {
      'ai-assistant': MobileAssistant,
      'calendar': MobileCalendar,
      'forms': MobileForms,
      'translate': MobileTranslate,
      'weather': MobileWeather,
      'center': MobileCenter,
      contacts: MobileContacts,
    };

    const AppComponent = appComponents[activeApp];
    if (!AppComponent) return null;

    return <AppComponent onBack={() => setActiveApp(null)} />;
  };

  const services: Service[] = [
    {
      id: 'ai-assistant',
      name: 'Assistant IA',
      description: 'Votre assistant personnel',
      icon: <Bot className="w-8 h-8" />,
      category: 'core',
      color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      featured: true,
      tags: ['ai', 'assistant', 'chat']
    },
    {
      id: 'calendar',
      name: 'Calendrier',
      description: 'Gérez votre emploi du temps',
      icon: <Calendar className="w-8 h-8" />,
      category: 'productivity',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      featured: true,
      tags: ['calendar', 'agenda', 'planning']
    },
    {
      id: 'forms',
      name: 'Formulaires',
      description: 'Créez et gérez vos formulaires',
      icon: <ListChecks className="w-8 h-8" />,
      category: 'productivity',
      color: 'bg-gradient-to-r from-green-500 to-lime-600',
      featured: false,
      tags: ['forms', 'survey', 'data']
    },
    {
      id: 'translate',
      name: 'Traducteur',
      description: 'Traduisez vos textes',
      icon: <Languages className="w-8 h-8" />,
      category: 'utilities',
      color: 'bg-gradient-to-r from-orange-500 to-yellow-600',
      featured: false,
      tags: ['translate', 'language', 'text']
    },
    {
      id: 'weather',
      name: 'Météo',
      description: 'Consultez la météo locale',
      icon: <Sun className="w-8 h-8" />,
      category: 'utilities',
      color: 'bg-gradient-to-r from-red-500 to-pink-600',
      featured: false,
      tags: ['weather', 'forecast', 'temperature']
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Gérez vos contacts et demandes d\'amitié',
      icon: <Users className="w-8 h-8" />,
      category: 'core',
      color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      featured: true,
      tags: ['social', 'communication', 'contacts']
    },
    {
      id: 'center',
      name: 'Center',
      description: 'Votre réseau social',
      icon: <Users className="w-8 h-8" />,
      category: 'core',
      color: 'bg-gradient-to-r from-violet-500 to-purple-600',
      featured: true,
      tags: ['social', 'communication', 'center']
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {activeApp ? (
        renderActiveApp()
      ) : (
        <>
          {renderHeader()}
          <div className="flex-1 overflow-y-auto">
            {renderCategoryTabs(['core', 'productivity', 'utilities'], services)}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileServices;
