
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Bot, Shield, Zap, Globe, Users, Sparkles, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PromotionalSections = () => {
  const features = [
    {
      icon: Mail,
      title: "LuvviX Mail",
      description: "Messagerie professionnelle avec IA intégrée",
      gradient: "from-blue-600 to-cyan-600",
      link: "/mail"
    },
    {
      icon: Bot,
      title: "AI Studio",
      description: "Créez des agents IA personnalisés",
      gradient: "from-purple-600 to-pink-600",
      link: "/ai-studio"
    },
    {
      icon: Shield,
      title: "LuvviX ID",
      description: "Authentification sécurisée universelle",
      gradient: "from-green-600 to-emerald-600",
      link: "/auth"
    },
    {
      icon: Zap,
      title: "Forms",
      description: "Formulaires intelligents et dynamiques",
      gradient: "from-orange-600 to-red-600",
      link: "/forms"
    }
  ];

  const stats = [
    { value: "10M+", label: "Utilisateurs actifs" },
    { value: "99.9%", label: "Disponibilité" },
    { value: "150+", label: "Pays couverts" },
    { value: "24/7", label: "Support technique" }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "CEO, TechStart",
      content: "LuvviX a révolutionné notre productivité. L'intégration IA est remarquable.",
      avatar: "M",
      rating: 5
    },
    {
      name: "Jean Martin",
      role: "CTO, InnovCorp",
      content: "La meilleure suite d'outils que nous ayons utilisée. Interface intuitive et puissante.",
      avatar: "J",
      rating: 5
    },
    {
      name: "Sophie Chen",
      role: "Designer, CreativeHub",
      content: "Design exceptionnel et fonctionnalités avancées. Exactement ce dont nous avions besoin.",
      avatar: "S",
      rating: 5
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Promotional Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20 text-lg px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Nouveau: LuvviX Mail Professional
              </Badge>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                L'avenir de la
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}productivité
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Découvrez une suite d'applications révolutionnaire qui transforme votre façon de travailler avec l'intelligence artificielle intégrée
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/mail">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4">
                    <Mail className="w-5 h-5 mr-2" />
                    Essayer LuvviX Mail
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/ecosystem">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
                    Explorer l'écosystème
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Applications Phares</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des outils puissants conçus pour transformer votre productivité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 h-full">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Rejoignez des millions d'utilisateurs</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Faites confiance à LuvviX pour transformer votre productivité
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Découvrez pourquoi des milliers d'entreprises nous font confiance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-gray-500 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à révolutionner votre productivité ?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez des millions d'utilisateurs qui ont déjà fait le choix de LuvviX
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/ecosystem">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
                  Découvrir nos solutions
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PromotionalSections;
