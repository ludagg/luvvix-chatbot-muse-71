
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, BookOpen, Clock, Target, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NewCourseCreator = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Formulaire de création de cours
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [coursePrice, setCoursePrice] = useState('');

  const categories = [
    'Marketing Digital',
    'Administration',
    'Business',
    'IA Générative',
    'Communication',
    'Productivity Tools'
  ];

  const difficulties = ['Débutant', 'Intermédiaire', 'Avancé'];

  const validateToken = async () => {
    setIsValidating(true);
    
    // Simulation de validation de token
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (accessToken === 'LUVVIX_CREATOR_2024' || accessToken === 'ADMIN_ACCESS') {
      setIsTokenValid(true);
      toast.success('Token validé avec succès ! Vous pouvez maintenant créer des cours.');
    } else {
      toast.error('Token d\'accès invalide. Contactez l\'administration.');
    }
    
    setIsValidating(false);
  };

  const createCourse = async () => {
    if (!courseTitle || !courseDescription || !courseCategory || !courseDifficulty) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Simulation de création de cours
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Cours "${courseTitle}" créé avec succès ! L'examen final sera généré automatiquement par IA.`);
    
    // Reset du formulaire
    setCourseTitle('');
    setCourseDescription('');
    setCourseCategory('');
    setCourseDifficulty('');
    setCourseDuration('');
    setCoursePrice('');
  };

  if (!isTokenValid) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">Accès Créateur de Cours</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seuls les instructeurs certifiés avec un token d'accès valide peuvent créer des cours sur LuvviX Learn.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Token d'accès *</label>
              <Input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Entrez votre token d'accès..."
                className="text-center"
              />
            </div>

            <Button
              onClick={validateToken}
              disabled={!accessToken || isValidating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isValidating ? 'Validation en cours...' : 'Valider le token'}
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">Informations importantes :</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Les cours sont créés manuellement par les instructeurs</li>
              <li>• Seuls les examens finaux (10 questions) sont générés par IA</li>
              <li>• Chaque cours doit être validé avant publication</li>
              <li>• Les certificats sont délivrés automatiquement après réussite</li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Vous n'avez pas de token ? Contactez l'équipe LuvviX à</p>
            <p className="font-medium">creators@luvvix.com</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header validé */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Accès Créateur Validé</h3>
              <p className="text-sm text-green-700">Vous pouvez maintenant créer des cours professionnels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Créer un nouveau cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Titre du cours *</label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Ex: Marketing Digital avec l'IA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <Select value={courseCategory} onValueChange={setCourseCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Décrivez le contenu et les objectifs du cours..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Niveau *</label>
              <Select value={courseDifficulty} onValueChange={setCourseDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Durée estimée</label>
              <Input
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                placeholder="Ex: 8 heures"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Prix (€)</label>
              <Input
                type="number"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                placeholder="0 pour gratuit"
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Rappel :</strong> L'examen final de 10 questions sera automatiquement généré par notre IA Gemini 1.5 Flash 
              une fois le cours publié. Vous pourrez modifier les questions si nécessaire.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={createCourse}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Créer le cours
            </Button>
            
            <Button variant="outline" className="flex-1">
              Sauvegarder comme brouillon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques créateur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">0</div>
            <div className="text-sm text-gray-600">Cours créés</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">0</div>
            <div className="text-sm text-gray-600">Étudiants inscrits</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">0€</div>
            <div className="text-sm text-gray-600">Revenus générés</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewCourseCreator;
