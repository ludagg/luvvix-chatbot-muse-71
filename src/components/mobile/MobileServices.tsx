import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import modular components
import { Service } from './services/types';
import { categories } from './services/categories';
import { aiServices } from './services/aiServices';
import { coreServices, luvvixServices } from './services/coreServices';
import ServiceCard from './services/ServiceCard';
import SearchBar from './services/SearchBar';
import CategoryTabs from './services/CategoryTabs';
import EcosystemStats from './services/EcosystemStats';

const MobileServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Combine all services including new LuvviX services
  const allServices: Service[] = [
    ...aiServices,
    ...coreServices,
    ...luvvixServices // Ajouter les nouveaux services LuvviX
  ];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || service.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (service: Service) => {
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
    const service = allServices.find(s => s.id === activeApp);
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
          
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <CategoryTabs 
            categories={categories}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onServiceClick={handleServiceClick}
            />
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

      <EcosystemStats servicesCount={allServices.length} />
    </div>
  );
};

export default MobileServices;
