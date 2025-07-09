
import React, { useState } from 'react';
import { ArrowLeft, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AINewsPreferences from '@/components/news/AINewsPreferences';
import AINewsBriefing from '@/components/news/AINewsBriefing';

interface MobileNewsPageProps {
  onBack: () => void;
}

const MobileNewsPage: React.FC<MobileNewsPageProps> = ({ onBack }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [newsPreferences, setNewsPreferences] = useState(null);

  const handlePreferencesSet = (preferences: any) => {
    setNewsPreferences(preferences);
    setShowPreferences(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
            <h1 className="text-lg font-semibold">Actualités IA</h1>
          </div>
        </div>
        
        <Button
          onClick={() => setShowPreferences(true)}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <Settings className="w-4 h-4 mr-1" />
          Préférences
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {showPreferences ? (
          <AINewsPreferences
            onPreferencesSet={handlePreferencesSet}
            onSkip={() => setShowPreferences(false)}
          />
        ) : newsPreferences ? (
          <AINewsBriefing preferences={newsPreferences} />
        ) : (
          <div className="p-4">
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Actualités IA Personnalisées
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Configurez vos préférences pour recevoir un briefing intelligent 
                des actualités qui vous intéressent vraiment.
              </p>
              <Button
                onClick={() => setShowPreferences(true)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Commencer la configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNewsPage;
