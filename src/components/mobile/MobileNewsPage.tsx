
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AINewsPreferences from '@/components/news/AINewsPreferences';
import AINewsBriefing from '@/components/news/AINewsBriefing';
import { hasUserConfiguredPreferences } from '@/services/news-service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MobileNewsPageProps {
  onBack: () => void;
}

const MobileNewsPage: React.FC<MobileNewsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [newsPreferences, setNewsPreferences] = useState(null);
  const [hasConfigured, setHasConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const configured = await hasUserConfiguredPreferences();
      setHasConfigured(configured);

      if (configured) {
        const { data } = await supabase
          .from('user_preferences')
          .select('news_preferences')
          .eq('user_id', user.id)
          .single();

        if (data?.news_preferences) {
          setNewsPreferences(data.news_preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSet = (preferences: any) => {
    setNewsPreferences(preferences);
    setHasConfigured(true);
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
      <div className="flex-1 pt-4">
        {showPreferences ? (
          <AINewsPreferences
            onPreferencesSet={handlePreferencesSet}
            onSkip={() => setShowPreferences(false)}
          />
        ) : loading ? (
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AINewsBriefing 
            preferences={newsPreferences}
            showSetup={!hasConfigured}
            onPreferencesSet={(categories) => {
              const preferences = {
                categories,
                sources: [],
                keywords: [],
                frequency: 'realtime',
                language: 'fr',
                location: true
              };
              handlePreferencesSet(preferences);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MobileNewsPage;
