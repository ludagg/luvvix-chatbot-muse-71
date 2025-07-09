
import React from 'react';
import { ArrowLeft, Settings, Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useNewsPreferences } from '@/hooks/useNewsPreferences';
import ModernNewsBriefing from '@/components/news/ModernNewsBriefing';
import AINewsPreferences from '@/components/news/AINewsPreferences';

interface MobileNewsPageProps {
  onBack: () => void;
}

const MobileNewsPage: React.FC<MobileNewsPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [showPreferences, setShowPreferences] = React.useState(false);
  const { preferences, savePreferences } = useNewsPreferences();

  const handlePreferencesSet = (newPreferences: any) => {
    savePreferences(newPreferences);
    setShowPreferences(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header moderne */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl mr-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Actualités IA
                </h1>
                <p className="text-xs text-muted-foreground">
                  Résumés personnalisés • {preferences.language.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPreferences(true)}
              variant="outline"
              size="sm"
              className="flex items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50"
            >
              <Settings className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Préférences</span>
            </Button>
          </div>
        </div>

        {/* Indicateur de statut */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">
              IA en temps réel • {preferences.categories.length} catégorie{preferences.categories.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1">
        {showPreferences ? (
          <div className="p-4">
            <AINewsPreferences
              onPreferencesSet={handlePreferencesSet}
              onSkip={() => setShowPreferences(false)}
            />
          </div>
        ) : (
          <ModernNewsBriefing 
            showSetup={preferences.categories.length === 0}
            onPreferencesSet={(categories) => {
              savePreferences({ categories });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MobileNewsPage;
