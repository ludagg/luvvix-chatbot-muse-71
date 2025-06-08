
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedAppsCarousel from "@/components/FeaturedAppsCarousel";
import Ecosystem from "@/components/Ecosystem";
import Authentication from "@/components/Authentication";
import ProductDemos from "@/components/ProductDemos";
import DeveloperSection from "@/components/DeveloperSection";
import LabSection from "@/components/LabSection";
import Careers from "@/components/Careers";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import NewsPreview from "@/components/news/NewsPreview";
import WeatherWidget from "@/components/weather/WeatherWidget";
import FormsPromo from "@/components/forms/FormsPromo";
import CeoSection from "@/components/CeoSection";
import AIStudioPromo from "@/components/ai-studio/AIStudioPromo";
import LuvvixIdPromo from "@/components/LuvvixIdPromo";
import CloudIntegration from "@/components/cloud/CloudIntegration";
import MailPromo from "@/components/mail/MailPromo";
import EnterpriseTrust from "@/components/EnterpriseTrust";
import { Bot, FileText, Newspaper, Cloud, Sparkles, AppWindow, ArrowRight, Languages, Network, Code, CloudSun, Search, Mail, Shield, Zap, Globe, Award, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navbar />

      <Hero />
      
      {/* Section confiance entreprise */}
      <EnterpriseTrust />
      
      {/* Section Cloud Integration ultra-moderne */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 mb-6 backdrop-blur-sm">
              <Cloud className="w-4 h-4 mr-2" />
              LuvviX Cloud - Révolution 2.0
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-white">
              Unifiez tous vos
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> clouds</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              La première plateforme mondiale qui unifie Google Drive, OneDrive, Dropbox et plus encore 
              dans une interface révolutionnaire. Synchronisation intelligente, sécurité renforcée, 
              performance ultime.
            </p>
          </motion.div>
          
          <CloudIntegration />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <Link to="/cloud">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
                <Cloud className="w-6 h-6 mr-3" />
                Découvrir LuvviX Cloud
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section LuvviX Mail */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mb-6">
              <Mail className="w-4 h-4 mr-2" />
              LuvviX Mail - Interface révolutionnaire
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              L'email réinventé pour les 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> professionnels</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Interface moderne comme Gmail pour tous vos comptes email. 
              Intégration parfaite avec LuvviX Cloud et Forms pour une productivité sans limites.
            </p>
          </motion.div>
          
          <MailPromo />
        </div>
      </section>
        
      {/* Section applications phares avec design premium */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Écosystème complet
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Une suite d'applications 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> révolutionnaire</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Découvrez notre écosystème intégré conçu pour maximiser votre productivité
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Cloud,
                name: 'LuvviX Cloud',
                description: 'Interface unifiée pour tous vos services cloud',
                href: '/cloud',
                gradient: 'from-blue-500 to-cyan-500',
                badge: 'Nouveau'
              },
              {
                icon: Mail,
                name: 'LuvviX Mail',
                description: 'Interface email moderne et unifiée',
                href: '/mail',
                gradient: 'from-purple-500 to-pink-500',
                badge: 'Populaire'
              },
              {
                icon: Search,
                name: 'LuvviX Explore',
                description: 'Recherche IA multimodale avancée',
                href: '/explore',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: Bot,
                name: 'AI Studio',
                description: 'Créez vos agents IA personnalisés',
                href: '/ai-studio',
                gradient: 'from-violet-500 to-purple-500',
                badge: 'IA'
              },
              {
                icon: Languages,
                name: 'LuvviX Translate',
                description: 'Traduction IA instantanée avec reconnaissance vocale',
                href: '/translate',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Network,
                name: 'MindMap',
                description: 'Cartes mentales intelligentes pour organiser vos idées',
                href: '/mindmap',
                gradient: 'from-indigo-500 to-blue-500'
              },
              {
                icon: Code,
                name: 'Code Studio',
                description: 'Génération et optimisation de code avec IA',
                href: '/code-studio',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: FileText,
                name: 'LuvviX Forms',
                description: 'Formulaires intelligents et analytics avancés',
                href: '/forms',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <HoverGlowCard className="group relative overflow-hidden p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <app.icon className="w-8 h-8" />
                      </div>
                      {app.badge && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs">
                          {app.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {app.description}
                    </p>
                    <Link to={app.href}>
                      <Button variant="outline" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                        Découvrir
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </HoverGlowCard>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link to="/ecosystem">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105">
                <AppWindow className="w-6 h-6 mr-3" /> 
                Explorer l'écosystème complet
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section sécurité et performances avec stats impressionnantes */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-6 backdrop-blur-sm">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité Enterprise
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Sécurité et Performance de 
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> niveau Enterprise</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              LuvviX utilise les technologies les plus avancées pour garantir la sécurité de vos données 
              et des performances optimales à l'échelle mondiale.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {[
              {
                icon: Shield,
                title: 'Sécurité Maximale',
                description: 'Chiffrement AES-256, authentification multi-facteurs, conformité SOC 2 Type II et GDPR.',
                stats: ['99.9% Uptime', 'Zero-Trust', 'ISO 27001'],
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Zap,
                title: 'Performance Ultra-Rapide',
                description: 'Infrastructure mondiale avec CDN, edge computing et optimisations IA pour une réactivité instantanée.',
                stats: ['<50ms latence', 'CDN global', 'Auto-scaling'],
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Globe,
                title: 'Disponibilité Globale',
                description: '150+ pays desservis, synchronisation temps réel et accès depuis n\'importe où dans le monde.',
                stats: ['150+ pays', '24/7 Support', 'Multi-région'],
                gradient: 'from-purple-500 to-pink-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 h-full">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {feature.stats.map((stat, statIndex) => (
                      <Badge key={statIndex} variant="outline" className="border-white/20 text-white bg-white/5">
                        {stat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats globales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-3xl p-12 backdrop-blur-sm border border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "99.99%", label: "Disponibilité", icon: TrendingUp },
                { value: "2M+", label: "Utilisateurs actifs", icon: Users },
                { value: "150+", label: "Pays desservis", icon: Globe },
                { value: "24/7", label: "Support Premium", icon: Award }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-blue-200 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
        
      <LuvvixIdPromo />
      <AIStudioPromo />
      <Ecosystem />
      <FormsPromo />
      <NewsPreview />
      <Authentication />
      <ProductDemos />
      <DeveloperSection />
      <LabSection />
      <CeoSection />
      <Careers />
      <Testimonials />
      
      <Footer />
    </div>
  );
};

export default Index;
