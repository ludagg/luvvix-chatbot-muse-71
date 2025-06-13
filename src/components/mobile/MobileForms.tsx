
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Eye, Edit3, Share2, Trash2, BarChart3, Copy, Sparkles, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FormData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  responses: number;
  published: boolean;
  createdAt: Date;
  lastModified: Date;
}

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multipleChoice' | 'checkboxes' | 'dropdown' | 'email' | 'number' | 'date';
  question: string;
  required: boolean;
  options?: string[];
}

interface MobileFormsProps {
  onBack: () => void;
}

const MobileForms = ({ onBack }: MobileFormsProps) => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'analytics'>('list');
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [newForm, setNewForm] = useState<Partial<FormData>>({
    title: '',
    description: '',
    questions: []
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  // Simuler des formulaires existants
  useEffect(() => {
    const mockForms: FormData[] = [
      {
        id: '1',
        title: 'Enquête de satisfaction client',
        description: 'Évaluez notre service pour nous aider à nous améliorer',
        questions: [
          {
            id: '1',
            type: 'multipleChoice',
            question: 'Comment évaluez-vous notre service ?',
            required: true,
            options: ['Excellent', 'Très bien', 'Bien', 'Moyen', 'Mauvais']
          },
          {
            id: '2',
            type: 'textarea',
            question: 'Avez-vous des suggestions d\'amélioration ?',
            required: false
          }
        ],
        responses: 247,
        published: true,
        createdAt: new Date(2024, 4, 1),
        lastModified: new Date(2024, 5, 10)
      },
      {
        id: '2',
        title: 'Inscription événement tech',
        description: 'Formulaire d\'inscription pour notre prochain événement technologique',
        questions: [
          {
            id: '1',
            type: 'text',
            question: 'Nom complet',
            required: true
          },
          {
            id: '2',
            type: 'email',
            question: 'Adresse email',
            required: true
          },
          {
            id: '3',
            type: 'multipleChoice',
            question: 'Niveau d\'expérience',
            required: true,
            options: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
          }
        ],
        responses: 89,
        published: true,
        createdAt: new Date(2024, 5, 5),
        lastModified: new Date(2024, 5, 12)
      },
      {
        id: '3',
        title: 'Feedback produit (Brouillon)',
        description: 'Collecte d\'avis sur notre nouveau produit',
        questions: [
          {
            id: '1',
            type: 'text',
            question: 'Quel produit avez-vous testé ?',
            required: true
          }
        ],
        responses: 0,
        published: false,
        createdAt: new Date(2024, 5, 13),
        lastModified: new Date(2024, 5, 13)
      }
    ];
    setForms(mockForms);
  }, []);

  const generateFormWithAI = async (description: string) => {
    setAiGenerating(true);
    try {
      // Simuler un appel à l'IA Gemini pour générer un formulaire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedQuestions: Question[] = [
        {
          id: `q-${Date.now()}-1`,
          type: 'text',
          question: 'Quel est votre nom ?',
          required: true
        },
        {
          id: `q-${Date.now()}-2`,
          type: 'email',
          question: 'Votre adresse email',
          required: true
        },
        {
          id: `q-${Date.now()}-3`,
          type: 'multipleChoice',
          question: 'Comment avez-vous entendu parler de nous ?',
          required: false,
          options: ['Réseaux sociaux', 'Bouche à oreille', 'Publicité', 'Recherche Google', 'Autre']
        },
        {
          id: `q-${Date.now()}-4`,
          type: 'textarea',
          question: 'Avez-vous des commentaires ou suggestions ?',
          required: false
        }
      ];

      const generatedForm: FormData = {
        id: `form-${Date.now()}`,
        title: `Formulaire généré par IA - ${description}`,
        description: `Formulaire automatiquement créé basé sur: ${description}`,
        questions: aiGeneratedQuestions,
        responses: 0,
        published: false,
        createdAt: new Date(),
        lastModified: new Date()
      };

      setForms([...forms, generatedForm]);
      setSelectedForm(generatedForm);
      setView('edit');
      
      toast({
        title: "Formulaire généré avec succès",
        description: "L'IA a créé un formulaire basé sur votre description",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le formulaire avec l'IA",
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const duplicateForm = (form: FormData) => {
    const duplicated: FormData = {
      ...form,
      id: `form-${Date.now()}`,
      title: `${form.title} (Copie)`,
      responses: 0,
      published: false,
      createdAt: new Date(),
      lastModified: new Date()
    };
    setForms([...forms, duplicated]);
    toast({
      title: "Formulaire dupliqué",
      description: "Le formulaire a été dupliqué avec succès",
    });
  };

  const deleteForm = (formId: string) => {
    setForms(forms.filter(f => f.id !== formId));
    toast({
      title: "Formulaire supprimé",
      description: "Le formulaire a été supprimé définitivement",
    });
  };

  const togglePublished = (formId: string) => {
    setForms(forms.map(f => 
      f.id === formId 
        ? { ...f, published: !f.published, lastModified: new Date() }
        : f
    ));
    const form = forms.find(f => f.id === formId);
    toast({
      title: form?.published ? "Formulaire dépublié" : "Formulaire publié",
      description: form?.published ? "Le formulaire n'est plus accessible" : "Le formulaire est maintenant accessible",
    });
  };

  const shareForm = (form: FormData) => {
    if (navigator.share) {
      navigator.share({
        title: form.title,
        text: form.description,
        url: `${window.location.origin}/forms/${form.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}`);
      toast({
        title: "Lien copié",
        description: "Le lien du formulaire a été copié dans le presse-papiers",
      });
    }
  };

  const getFilteredForms = () => {
    let filtered = forms;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(form => 
        filterStatus === 'published' ? form.published : !form.published
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(form => 
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  };

  const addQuestion = (type: Question['type']) => {
    if (!selectedForm) return;
    
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      question: 'Nouvelle question',
      required: false,
      options: type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown' 
        ? ['Option 1', 'Option 2'] 
        : undefined
    };
    
    const updatedForm = {
      ...selectedForm,
      questions: [...selectedForm.questions, newQuestion],
      lastModified: new Date()
    };
    
    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!selectedForm) return;
    
    const updatedForm = {
      ...selectedForm,
      questions: selectedForm.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ),
      lastModified: new Date()
    };
    
    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const removeQuestion = (questionId: string) => {
    if (!selectedForm) return;
    
    const updatedForm = {
      ...selectedForm,
      questions: selectedForm.questions.filter(q => q.id !== questionId),
      lastModified: new Date()
    };
    
    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const renderFormsList = () => (
    <div className="space-y-4">
      {/* Recherche et filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un formulaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'published', label: 'Publiés' },
            { key: 'draft', label: 'Brouillons' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterStatus === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des formulaires */}
      <div className="space-y-3">
        {getFilteredForms().map(form => (
          <div key={form.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{form.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    form.published 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {form.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <span>{form.questions.length} questions</span>
                  <span>{form.responses} réponses</span>
                  <span>Modifié {form.lastModified.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedForm(form);
                  setView('analytics');
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyser</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedForm(form);
                  setView('edit');
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              
              <button
                onClick={() => shareForm(form)}
                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => duplicateForm(form)}
                className="p-1 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => togglePublished(form.id)}
                className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {form.published ? <Eye className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => deleteForm(form.id)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {getFilteredForms().length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire trouvé</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Créez votre premier formulaire pour commencer'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={() => setView('create')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Créer un formulaire
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Créer un nouveau formulaire</h2>
        
        {/* Création manuelle */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <h3 className="font-medium mb-3">Création manuelle</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titre du formulaire"
              value={newForm.title}
              onChange={(e) => setNewForm({...newForm, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Description du formulaire"
              value={newForm.description}
              onChange={(e) => setNewForm({...newForm, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={() => {
                if (newForm.title) {
                  const form: FormData = {
                    id: `form-${Date.now()}`,
                    title: newForm.title,
                    description: newForm.description || '',
                    questions: [],
                    responses: 0,
                    published: false,
                    createdAt: new Date(),
                    lastModified: new Date()
                  };
                  setForms([...forms, form]);
                  setSelectedForm(form);
                  setView('edit');
                  setNewForm({ title: '', description: '', questions: [] });
                }
              }}
              disabled={!newForm.title}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Créer le formulaire
            </button>
          </div>
        </div>

        {/* Génération avec IA */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">Génération automatique avec IA</h3>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Décrivez le type de formulaire que vous souhaitez créer et l'IA générera automatiquement les questions appropriées.
          </p>
          <div className="space-y-3">
            <textarea
              placeholder="Ex: Formulaire de satisfaction client pour un restaurant, Enquête sur les habitudes alimentaires, Inscription à un événement sportif..."
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={() => generateFormWithAI("Formulaire de test généré par IA")}
              disabled={aiGenerating}
              className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {aiGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer avec l'IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditForm = () => {
    if (!selectedForm) return null;

    return (
      <div className="space-y-6">
        <div>
          <input
            type="text"
            value={selectedForm.title}
            onChange={(e) => {
              const updated = { ...selectedForm, title: e.target.value, lastModified: new Date() };
              setSelectedForm(updated);
              setForms(forms.map(f => f.id === selectedForm.id ? updated : f));
            }}
            className="w-full text-xl font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <textarea
            value={selectedForm.description}
            onChange={(e) => {
              const updated = { ...selectedForm, description: e.target.value, lastModified: new Date() };
              setSelectedForm(updated);
              setForms(forms.map(f => f.id === selectedForm.id ? updated : f));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="Description du formulaire"
          />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions ({selectedForm.questions.length})</h3>
            <div className="flex space-x-2">
              <select
                onChange={(e) => addQuestion(e.target.value as Question['type'])}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                value=""
              >
                <option value="">Ajouter une question</option>
                <option value="text">Texte court</option>
                <option value="textarea">Texte long</option>
                <option value="multipleChoice">Choix multiple</option>
                <option value="checkboxes">Cases à cocher</option>
                <option value="dropdown">Liste déroulante</option>
                <option value="email">Email</option>
                <option value="number">Nombre</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>

          {selectedForm.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                placeholder="Saisissez votre question"
              />
              
              <div className="flex items-center space-x-4 mb-3">
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="text">Texte court</option>
                  <option value="textarea">Texte long</option>
                  <option value="multipleChoice">Choix multiple</option>
                  <option value="checkboxes">Cases à cocher</option>
                  <option value="dropdown">Liste déroulante</option>
                  <option value="email">Email</option>
                  <option value="number">Nombre</option>
                  <option value="date">Date</option>
                </select>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Obligatoire</span>
                </label>
              </div>
              
              {(question.type === 'multipleChoice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Options :</label>
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optionIndex] = e.target.value;
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options?.filter((_, i) => i !== optionIndex);
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(question.options || []), ''];
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    + Ajouter une option
                  </button>
                </div>
              )}
            </div>
          ))}

          {selectedForm.questions.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-4">Aucune question dans ce formulaire</p>
              <button
                onClick={() => addQuestion('text')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ajouter votre première question
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => togglePublished(selectedForm.id)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              selectedForm.published
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {selectedForm.published ? 'Dépublier' : 'Publier'}
          </button>
          <button
            onClick={() => shareForm(selectedForm)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Partager
          </button>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!selectedForm) return null;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">{selectedForm.title}</h2>
          <p className="text-gray-600">{selectedForm.description}</p>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{selectedForm.responses}</div>
            <div className="text-sm text-gray-600">Réponses totales</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{Math.round(selectedForm.responses * 0.85)}</div>
            <div className="text-sm text-gray-600">Réponses complètes</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
            <div className="text-sm text-gray-600">Taux de completion</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">2.5</div>
            <div className="text-sm text-gray-600">Temps moyen (min)</div>
          </div>
        </div>

        {/* Graphiques simulés */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold mb-4">Réponses par jour (7 derniers jours)</h3>
          <div className="h-32 bg-gradient-to-t from-blue-100 to-transparent rounded-lg flex items-end justify-between p-4">
            {[12, 8, 15, 22, 18, 25, 30].map((height, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-t-sm flex-1 mx-1"
                style={{ height: `${height * 2}px` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>
        </div>

        {/* Analyse des questions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Analyse des questions</h3>
          {selectedForm.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-medium mb-2">Q{index + 1}: {question.question}</h4>
              {question.type === 'multipleChoice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const percentage = Math.random() * 100;
                    return (
                      <div key={optionIndex} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-20">{option}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {question.type === 'text' || question.type === 'textarea' && (
                <div className="text-sm text-gray-600">
                  <p>Réponses textuelles analysées par IA :</p>
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p>• Sentiment positif : 78%</p>
                    <p>• Mots-clés fréquents : "excellent", "rapide", "facile"</p>
                    <p>• Suggestions d'amélioration mentionnées : 12</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {view === 'list' ? 'LuvviX Forms' :
             view === 'create' ? 'Nouveau formulaire' :
             view === 'edit' ? 'Modifier le formulaire' :
             'Analytics'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {view === 'list' && (
            <button
              onClick={() => setView('create')}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          {(view === 'edit' || view === 'analytics') && (
            <button
              onClick={() => {
                setView('list');
                setSelectedForm(null);
              }}
              className="px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Retour
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'list' && renderFormsList()}
        {view === 'create' && renderCreateForm()}
        {view === 'edit' && renderEditForm()}
        {view === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default MobileForms;
