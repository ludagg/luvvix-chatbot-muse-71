
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, BookOpen, Clock, Target, Users, AlertCircle, CheckCircle, Plus } from "lucide-react";
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
  const [instructorName, setInstructorName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
  const [courseMaterial, setCourseMaterial] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);

  const categories = [
    'Marketing Digital',
    'Administration',
    'Business',
    'IA Générative',
    'Communication',
    'Productivity Tools'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' }
  ];

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

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    value: string
  ) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const createCourse = async () => {
    if (!courseTitle || !courseDescription || !courseCategory || !courseDifficulty || !instructorName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const courseData = {
      title: courseTitle,
      description: courseDescription,
      category: courseCategory,
      difficulty_level: courseDifficulty,
      duration_minutes: courseDuration ? parseInt(courseDuration) * 60 : 60,
      instructor_name: instructorName,
      thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
      enrollment_count: 0,
      rating: 0.0,
      price: coursePrice ? parseFloat(coursePrice) : 0.00,
      is_free: !coursePrice || parseFloat(coursePrice) === 0,
      learning_objectives: learningObjectives.filter(obj => obj.trim() !== ''),
      what_you_will_learn: whatYouWillLearn.filter(item => item.trim() !== ''),
      course_material: courseMaterial.filter(item => item.trim() !== ''),
      prerequisites: prerequisites.filter(item => item.trim() !== ''),
      certificate_available: true
    };

    try {
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
      setInstructorName('');
      setThumbnailUrl('');
      setLearningObjectives(['']);
      setWhatYouWillLearn(['']);
      setCourseMaterial(['']);
      setPrerequisites(['']);
    } catch (error) {
      toast.error('Erreur lors de la création du cours');
    }
  };

  const ArrayInput = ({ 
    label, 
    items, 
    setItems, 
    placeholder 
  }: { 
    label: string; 
    items: string[]; 
    setItems: React.Dispatch<React.SetStateAction<string[]>>; 
    placeholder: string;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateArrayItem(setItems, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(setItems, index)}
            >
              ×
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem(setItems)}
        className="flex items-center gap-2"
      >
        <Plus size={14} />
        Ajouter {label.toLowerCase()}
      </Button>
    </div>
  );

  if (!isTokenValid) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="h-10 w-10" />
              <CardTitle className="text-2xl">Accès Créateur de Cours</CardTitle>
            </div>
            <p className="text-blue-100">
              Interface professionnelle de création de cours LuvviX Learn
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Accès restreint :</strong> Seuls les instructeurs certifiés avec un token d'accès valide peuvent créer des cours sur LuvviX Learn.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Token d'accès *</label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Entrez votre token d'accès instructeur..."
                  className="text-center h-12 text-lg"
                />
                <p className="text-xs text-gray-500 text-center">
                  Le token est sensible à la casse
                </p>
              </div>

              <Button
                onClick={validateToken}
                disabled={!accessToken || isValidating}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
              >
                {isValidating ? 'Validation en cours...' : 'Valider le token d\'accès'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Fonctionnalités incluses
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Création manuelle de cours professionnels</li>
                  <li>• Interface intuitive de gestion de contenu</li>
                  <li>• Génération automatique d'examens par IA</li>
                  <li>• Certificats automatiques pour les apprenants</li>
                  <li>• Analytics de performance avancés</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Processus de validation
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Cours créés manuellement par les instructeurs</li>
                  <li>• Examens générés automatiquement par Gemini 1.5 Flash</li>
                  <li>• Validation éditoriale avant publication</li>
                  <li>• Support technique dédié aux créateurs</li>
                </ul>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Vous n'avez pas encore de token d'accès ?</strong>
              </p>
              <p className="text-sm text-gray-500">
                Contactez l'équipe LuvviX à{' '}
                <a href="mailto:creators@luvvix.com" className="text-blue-600 hover:underline font-medium">
                  creators@luvvix.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header validé */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 border-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-800">Accès Créateur Validé</h3>
              <p className="text-green-700">Vous pouvez maintenant créer des cours professionnels sur LuvviX Learn</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de création */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            Créer un nouveau cours
          </CardTitle>
          <p className="text-blue-100">
            Remplissez les informations ci-dessous pour créer votre cours professionnel
          </p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Informations de base */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Informations générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Titre du cours *</label>
                <Input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ex: Marketing Digital avec l'IA"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie *</label>
                <Select value={courseCategory} onValueChange={setCourseCategory}>
                  <SelectTrigger className="h-12">
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

              <div>
                <label className="block text-sm font-medium mb-2">Niveau *</label>
                <Select value={courseDifficulty} onValueChange={setCourseDifficulty}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Niveau de difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instructeur *</label>
                <Input
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="Nom de l'instructeur"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Durée estimée (heures)</label>
                <Input
                  type="number"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  placeholder="Ex: 8"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prix (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(e.target.value)}
                  placeholder="0 pour gratuit"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de l'image (optionnel)</label>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Décrivez le contenu et les objectifs du cours..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Contenus détaillés */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Contenu détaillé</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ArrayInput
                label="Objectifs d'apprentissage"
                items={learningObjectives}
                setItems={setLearningObjectives}
                placeholder="Ex: Maîtriser les outils IA pour le marketing"
              />

              <ArrayInput
                label="Ce que vous apprendrez"
                items={whatYouWillLearn}
                setItems={setWhatYouWillLearn}
                placeholder="Ex: Utilisation de ChatGPT pour le copywriting"
              />

              <ArrayInput
                label="Matériel de cours inclus"
                items={courseMaterial}
                setItems={setCourseMaterial}
                placeholder="Ex: 12 vidéos HD"
              />

              <ArrayInput
                label="Prérequis"
                items={prerequisites}
                setItems={setPrerequisites}
                placeholder="Ex: Bases du marketing digital"
              />
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important :</strong> L'examen final de 10 questions sera automatiquement généré par notre IA Gemini 1.5 Flash 
              une fois le cours publié. Vous pourrez modifier les questions si nécessaire.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={createCourse}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-lg"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Créer le cours
            </Button>
            
            <Button variant="outline" className="flex-1 h-12 text-lg">
              Sauvegarder comme brouillon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques créateur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-blue-100">Cours créés</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-green-100">Étudiants inscrits</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">0€</div>
            <div className="text-purple-100">Revenus générés</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewCourseCreator;
