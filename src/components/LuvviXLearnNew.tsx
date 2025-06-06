
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Trophy, Clock, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import NewCourseCreator from './learn/NewCourseCreator';

const SAMPLE_COURSES = [
  {
    id: '1',
    title: 'Marketing Digital avec l\'IA',
    description: 'Apprenez à utiliser l\'intelligence artificielle pour optimiser vos campagnes marketing',
    category: 'Marketing Digital',
    difficulty: 'intermediate',
    duration: 480,
    lessons: 12,
    enrolled: 1250,
    rating: 4.8,
    certificate: true
  },
  {
    id: '2',
    title: 'Administration Moderne',
    description: 'Techniques d\'administration efficaces avec les outils numériques',
    category: 'Administration & Gestion',
    difficulty: 'beginner',
    duration: 300,
    lessons: 8,
    enrolled: 890,
    rating: 4.6,
    certificate: true
  },
  {
    id: '3',
    title: 'Entrepreneuriat Digital',
    description: 'Créez et développez votre business en ligne',
    category: 'Business & Entrepreneuriat',
    difficulty: 'intermediate',
    duration: 600,
    lessons: 15,
    enrolled: 650,
    rating: 4.9,
    certificate: true
  }
];

const LuvviXLearnNew = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LuvviX Learn</h1>
              <p className="text-gray-600 mt-1">Plateforme d'apprentissage intelligente</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users size={14} />
                2,790 apprenants actifs
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy size={14} />
                850 certificats délivrés
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <BookOpen size={16} />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus size={16} />
              Créer
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy size={16} />
              Mon espace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-8">
            <div className="space-y-6">
              {/* Barre de recherche et filtres */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des cours..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filtres
                </Button>
              </div>

              {/* Cours recommandés */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Cours recommandés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAMPLE_COURSES.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{course.category}</Badge>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty === 'beginner' ? 'Débutant' : 'Intermédiaire'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{Math.round(course.duration / 60)}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{course.lessons} leçons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{course.enrolled}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {course.certificate && (
                              <Badge variant="outline" className="text-xs">
                                <Trophy size={12} className="mr-1" />
                                Certificat
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              ⭐ {course.rating}
                            </Badge>
                          </div>
                          
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Commencer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-8">
            <NewCourseCreator />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-700 mb-2">0</h3>
                  <p className="text-gray-600">Cours en cours</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-700 mb-2">0</h3>
                  <p className="text-gray-600">Certificats obtenus</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-700 mb-2">0h</h3>
                  <p className="text-gray-600">Temps d'apprentissage</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Commencez votre parcours d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Explorez notre catalogue de cours ou créez votre propre cours personnalisé avec l'IA.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab('catalog')}>
                    Parcourir les cours
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('create')}>
                    Créer un cours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXLearnNew;
