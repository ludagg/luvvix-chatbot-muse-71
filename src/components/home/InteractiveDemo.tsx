
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Cloud, Mail, Code, Play, Pause } from "lucide-react";

const InteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState("ai");
  const [isPlaying, setIsPlaying] = useState(false);

  const demos = {
    ai: {
      title: "LuvviX AI en Action",
      description: "Regardez comment notre IA Gemini 1.5 Flash génère du contenu intelligent",
      icon: Bot,
      color: "from-purple-500 to-indigo-500",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Prompt utilisateur:</p>
            <p className="font-medium">"Écris un email professionnel pour planifier une réunion"</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Réponse IA:</p>
            <div className="prose dark:prose-invert">
              <p className="font-medium">Objet: Planification réunion équipe - Projet Q1</p>
              <p className="text-sm mt-2">Bonjour [Nom],</p>
              <p className="text-sm">J'espère que vous allez bien. Je souhaiterais organiser une réunion d'équipe pour discuter de l'avancement de notre projet Q1...</p>
            </div>
          </motion.div>
        </div>
      )
    },
    cloud: {
      title: "Synchronisation Cloud",
      description: "Synchronisation en temps réel entre tous vos services cloud",
      icon: Cloud,
      color: "from-cyan-500 to-blue-500",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center"
            >
              <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">Google Drive</p>
              <Badge variant="secondary" className="mt-1">Synchronisé</Badge>
            </motion.div>
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 2, delay: 0.5 }}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center"
            >
              <Cloud className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Dropbox</p>
              <Badge variant="secondary" className="mt-1">En sync...</Badge>
            </motion.div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✓ 1,247 fichiers synchronisés
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Dernière sync: il y a 2 secondes
            </p>
          </div>
        </div>
      )
    },
    mail: {
      title: "LuvviX Mail Intelligent",
      description: "Messagerie avec IA et traduction automatique intégrée",
      icon: Mail,
      color: "from-emerald-500 to-teal-500",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Email entrant (Español)</p>
              <Badge>Auto-traduit</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "Hola, me gustaría programar una reunión..."
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-emerald-500"
          >
            <p className="text-sm font-medium mb-2">Traduction automatique:</p>
            <p className="text-sm">"Bonjour, j'aimerais programmer une réunion..."</p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500">Réponse IA suggérée:</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                "Bien sûr, je serais ravi de planifier cette réunion. Quelles seraient vos disponibilités cette semaine ?"
              </p>
            </div>
          </motion.div>
        </div>
      )
    },
    api: {
      title: "API Développeur",
      description: "Intégrez LuvviX ID dans vos applications en quelques lignes",
      icon: Code,
      color: "from-orange-500 to-amber-500",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
            <p className="text-gray-400">// Authentification simple</p>
            <p>const auth = new LuvvixAuth({'{'}apiKey{'}'})</p>
            <p className="mt-2 text-gray-400">// Connexion utilisateur</p>
            <p>const user = await auth.login(email, password)</p>
            <p className="mt-2 text-gray-400">// Vérification token</p>
            <p>const isValid = await auth.verify(token)</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✓ 10 clés API prêtes à l'emploi
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Documentation complète disponible
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Découvrez LuvviX en action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Des démonstrations interactives pour comprendre la puissance de notre écosystème
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Navigation */}
          <div className="space-y-4">
            {Object.entries(demos).map(([key, demo]) => (
              <motion.button
                key={key}
                onClick={() => setActiveDemo(key)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
                  activeDemo === key
                    ? 'bg-gradient-to-r ' + demo.color + ' text-white'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <demo.icon className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold text-lg">{demo.title}</h3>
                    <p className={`text-sm ${activeDemo === key ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {demo.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Demo Content */}
          <Card className="h-96 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {React.createElement(demos[activeDemo].icon, { className: "w-6 h-6" })}
                  <span>{demos[activeDemo].title}</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {demos[activeDemo].content}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
