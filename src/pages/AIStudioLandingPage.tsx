
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bot,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Star,
  Code,
  Zap,
  CheckCircle2,
  BrainCircuit,
  GraduationCap,
  TrendingUp,
  HeartHandshake,
  Users
} from "lucide-react";

const AIStudioLandingPage = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/20 dark:to-slate-900 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-sm font-medium text-violet-800 dark:text-violet-300 mb-6">
                  <Sparkles className="h-4 w-4 mr-1" /> Nouveau
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 dark:from-violet-400 dark:to-indigo-400">
                  Créez des agents IA personnalisés en quelques minutes
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                  LuvviX AI Studio vous permet de concevoir des assistants intelligents adaptés à vos besoins spécifiques, sans aucune compétence en programmation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 text-white">
                    <Link to="/ai-studio/create">
                      Créer un agent <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/ai-studio/marketplace">
                      Explorer le marketplace <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-violet-${100 + i * 100} dark:bg-violet-${900 - i * 100} flex items-center justify-center text-xs font-medium text-violet-800 dark:text-violet-200`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    +2500 utilisateurs actifs
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 mr-3">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Assistant Expert IA</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Spécialisé en IA et Machine Learning</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-700 dark:text-slate-300">Comment fonctionne l'apprentissage par renforcement ?</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-lg border-l-4 border-violet-500">
                      <p className="text-slate-700 dark:text-slate-300">L'apprentissage par renforcement est une approche où un agent apprend à prendre des décisions en effectuant des actions dans un environnement pour maximiser une récompense cumulée...</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-700 dark:text-slate-300">Peux-tu me donner un exemple concret ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center mr-4">
                      <Star className="h-4 w-4 mr-1 text-amber-500" />
                      <span>4.9</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>12K conversations</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 -bottom-4 -left-4 -z-10 bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-600 rounded-xl opacity-20 blur-lg"></div>
                
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Tout ce qu'il faut pour créer des agents IA puissants
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Des outils intuitifs qui vous permettent de concevoir, entraîner et déployer des agents IA sans écrire de code.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit className="h-6 w-6 text-violet-600" />,
                  title: "IA avancée",
                  description: "Propulsé par Cerebras, nos agents sont rapides, intelligents et constamment améliorés."
                },
                {
                  icon: <Sparkles className="h-6 w-6 text-amber-500" />,
                  title: "Personnalisation complète",
                  description: "Adaptez le comportement, les connaissances et la personnalité de votre agent selon vos besoins."
                },
                {
                  icon: <Code className="h-6 w-6 text-emerald-500" />,
                  title: "Sans code",
                  description: "Interface intuitive permettant à tous de créer des agents IA, quel que soit votre niveau technique."
                },
                {
                  icon: <Zap className="h-6 w-6 text-blue-500" />,
                  title: "Déploiement instantané",
                  description: "Mettez votre agent en ligne en un clic et commencez à l'utiliser immédiatement."
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
                  title: "Intégration facile",
                  description: "Intégrez votre agent sur votre site web, application ou dans vos outils existants."
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-red-500" />,
                  title: "Analytics détaillés",
                  description: "Suivez les performances de votre agent et optimisez-le en fonction des interactions réelles."
                }
              ].map((feature, index) => (
                <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-4 p-3 rounded-full bg-slate-100 dark:bg-slate-800 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Use Cases */}
        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Des cas d'utilisation pour tous les besoins
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Découvrez comment les agents IA peuvent transformer votre entreprise ou vos projets personnels.
              </p>
            </div>
            
            <Tabs defaultValue="business" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
                <TabsTrigger value="business">Entreprises</TabsTrigger>
                <TabsTrigger value="education">Éducation</TabsTrigger>
                <TabsTrigger value="personal">Personnel</TabsTrigger>
              </TabsList>
              
              <TabsContent value="business" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300 mb-4">
                          Support client
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          Assistant de support client 24/7
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          Créez un agent capable de répondre aux questions fréquentes, de résoudre les problèmes courants et de transférer les demandes complexes à votre équipe.
                        </p>
                        <ul className="space-y-2 mb-6">
                          {["Disponible 24h/24 et 7j/7", "Réduit les temps d'attente", "Augmente la satisfaction client"].map((item, i) => (
                            <li key={i} className="flex items-center">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-slate-700 dark:text-slate-200">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Link to="/ai-studio/create">
                            Créer un assistant de support
                          </Link>
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                        <div className="space-y-4">
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-700 dark:text-slate-300">Comment puis-je modifier mon abonnement ?</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                            <p className="text-slate-700 dark:text-slate-300">Pour modifier votre abonnement, connectez-vous à votre compte et accédez à la section "Paramètres", puis "Abonnement". Vous pourrez y choisir parmi nos différentes formules.</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                            <p className="text-slate-700 dark:text-slate-300">Souhaitez-vous que je vous montre comment accéder à cette section ?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="education" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300 mb-4">
                          Éducation
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          Tuteur personnel intelligent
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          Créez un agent éducatif qui aide les étudiants à comprendre des concepts complexes, répond à leurs questions et fournit des exercices adaptés.
                        </p>
                        <ul className="space-y-2 mb-6">
                          {["Apprentissage personnalisé", "Disponible à tout moment", "Approche pédagogique adaptative"].map((item, i) => (
                            <li key={i} className="flex items-center">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-slate-700 dark:text-slate-200">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                          <Link to="/ai-studio/create">
                            Créer un tuteur IA
                          </Link>
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                        <div className="space-y-4">
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-700 dark:text-slate-300">Peux-tu m'expliquer les équations différentielles ?</p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
                            <p className="text-slate-700 dark:text-slate-300">Les équations différentielles sont des équations qui relient une fonction à ses dérivées. Commençons par comprendre ce qu'est une dérivée...</p>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-700 dark:text-slate-300">Peux-tu me donner un exemple simple ?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300 mb-4">
                          Personnel
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          Coach personnel virtuel
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          Créez un coach qui vous aide à atteindre vos objectifs, qu'il s'agisse de fitness, de productivité ou de développement personnel.
                        </p>
                        <ul className="space-y-2 mb-6">
                          {["Encouragement quotidien", "Suivi des progrès", "Conseils personnalisés"].map((item, i) => (
                            <li key={i} className="flex items-center">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-slate-700 dark:text-slate-200">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                          <Link to="/ai-studio/create">
                            Créer un coach virtuel
                          </Link>
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                        <div className="space-y-4">
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-700 dark:text-slate-300">J'ai du mal à maintenir une routine de méditation. Des conseils ?</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-500">
                            <p className="text-slate-700 dark:text-slate-300">Commencez par de courtes sessions de 5 minutes et augmentez progressivement. La cohérence est plus importante que la durée. Avez-vous essayé de méditer à la même heure chaque jour ?</p>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-700 dark:text-slate-300">Non, pas vraiment. Quel est le meilleur moment ?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Comment ça fonctionne
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Créer votre propre agent IA n'a jamais été aussi simple
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  number: "01",
                  title: "Configurez votre agent",
                  description: "Définissez le nom, la personnalité et l'objectif de votre agent IA.",
                  icon: <Bot className="h-8 w-8 text-violet-600" />
                },
                {
                  number: "02",
                  title: "Entraînez avec vos données",
                  description: "Téléchargez des documents ou ajoutez des connaissances spécifiques à votre domaine.",
                  icon: <GraduationCap className="h-8 w-8 text-violet-600" />
                },
                {
                  number: "03",
                  title: "Déployez et partagez",
                  description: "Mettez votre agent en ligne et partagez-le avec votre équipe ou vos clients.",
                  icon: <Share className="h-8 w-8 text-violet-600" />
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-violet-200 dark:bg-violet-800 -z-10">
                      <div className="absolute top-0 right-0 w-3 h-3 bg-violet-400 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 mb-4">
                      {step.icon}
                    </div>
                    <div className="font-bold text-4xl text-violet-200 dark:text-violet-800 mb-2">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 text-white">
                <Link to="/ai-studio/create">
                  Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Ce que disent nos utilisateurs
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Découvrez pourquoi les créateurs adorent LuvviX AI Studio
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sophie Laurent",
                  role: "Responsable marketing",
                  content: "LuvviX AI Studio m'a permis de créer un assistant qui répond aux questions sur nos produits 24/7. Nos clients sont ravis et notre équipe peut se concentrer sur des tâches à plus forte valeur ajoutée.",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                },
                {
                  name: "Thomas Mercier",
                  role: "Professeur d'université",
                  content: "Je me suis créé un assistant qui aide mes étudiants à comprendre les concepts complexes de mes cours. L'interface est intuitive et le résultat est impressionnant.",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                },
                {
                  name: "Julie Moreau",
                  role: "Entrepreneur",
                  content: "Grâce à LuvviX AI Studio, j'ai pu créer un agent qui me fait gagner un temps précieux en répondant aux questions courantes de mes clients potentiels. Un outil incontournable pour mon entreprise.",
                  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start">
                      <div className="flex-shrink-0">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Prêt à créer votre agent IA ?
              </h2>
              <p className="text-xl text-violet-100 mb-8">
                Commencez gratuitement aujourd'hui et découvrez la puissance de l'IA personnalisée.
              </p>
              <Button asChild size="lg" variant="secondary" className="bg-white text-violet-700 hover:bg-gray-100">
                <Link to="/ai-studio/create">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Créer mon premier agent
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Questions fréquentes
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Tout ce que vous devez savoir sur LuvviX AI Studio
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {[
                {
                  question: "Ai-je besoin de compétences en programmation pour utiliser LuvviX AI Studio ?",
                  answer: "Non, LuvviX AI Studio est conçu pour être utilisé sans aucune compétence en programmation. Notre interface intuitive vous guide à travers toutes les étapes de création de votre agent IA."
                },
                {
                  question: "Comment mon agent IA apprend-il ?",
                  answer: "Votre agent IA est basé sur des modèles d'intelligence artificielle avancés qui ont déjà été entraînés sur de vastes quantités de données. Vous pouvez ensuite personnaliser son comportement et ses connaissances en lui fournissant des informations spécifiques à votre domaine."
                },
                {
                  question: "Puis-je intégrer mon agent IA sur mon site web ?",
                  answer: "Oui, vous pouvez facilement intégrer votre agent IA sur votre site web en copiant et collant un simple code d'intégration que nous vous fournissons. Vous pouvez également le partager via un lien direct."
                },
                {
                  question: "Est-ce que LuvviX AI Studio est gratuit ?",
                  answer: "LuvviX AI Studio propose une version gratuite avec des fonctionnalités limitées. Des forfaits payants sont disponibles pour accéder à des fonctionnalités avancées, une plus grande capacité de traitement et un support prioritaire."
                },
                {
                  question: "Qui a accès aux conversations avec mon agent ?",
                  answer: "Seul vous, en tant que créateur de l'agent, avez accès aux conversations de votre agent. Nous prenons la confidentialité très au sérieux et ne partageons pas ces données avec des tiers."
                }
              ].map((faq, index) => (
                <div key={index} className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioLandingPage;

// Import manquant pour le composant Share
function Share(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "24"}
      height={props.size || "24"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className || ""}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

