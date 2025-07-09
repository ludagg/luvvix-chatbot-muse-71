
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useNewsPreferences } from '@/hooks/useNewsPreferences';

const LanguageSettings = () => {
  const { language, setLanguage, languages } = useLanguage();
  const { savePreferences } = useNewsPreferences();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Mettre à jour aussi les préférences news
    savePreferences({ language: newLanguage });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Langue / Language
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              variant={language === lang.code ? "default" : "outline"}
              className={`justify-start h-12 ${
                language === lang.code 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-lg mr-3">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {language === lang.code && (
                <Check className="w-4 h-4" />
              )}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          La langue sélectionnée sera utilisée pour l'interface et les résumés d'actualités générés par l'IA.
        </p>
      </CardContent>
    </Card>
  );
};

export default LanguageSettings;
