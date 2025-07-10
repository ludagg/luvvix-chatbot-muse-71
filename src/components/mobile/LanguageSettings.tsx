
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Check } from 'lucide-react';
import { useLanguagePreferences } from '@/hooks/use-language-preferences';
import { toast } from '@/hooks/use-toast';

const LanguageSettings = () => {
  const { language, setLanguage, availableLanguages } = useLanguagePreferences();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const selectedLang = availableLanguages.find(lang => lang.code === newLanguage);
    
    toast({
      title: "Langue mise à jour",
      description: `Langue changée vers ${selectedLang?.name}. Les actualités seront maintenant dans cette langue.`,
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Languages className="w-5 h-5 text-blue-600" />
          Langue préférée
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choisissez votre langue pour les actualités et le contenu
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {availableLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                flex items-center justify-between p-4 h-auto
                ${language === lang.code 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }
                transition-all duration-200 rounded-xl
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              
              {language === lang.code && (
                <Check className="w-5 h-5" />
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Actuellement
            </Badge>
            <span className="text-sm font-medium text-blue-900">
              {availableLanguages.find(lang => lang.code === language)?.name}
            </span>
          </div>
          <p className="text-xs text-blue-700">
            Les actualités et résumés seront générés dans cette langue par LuvviX AI
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSettings;
