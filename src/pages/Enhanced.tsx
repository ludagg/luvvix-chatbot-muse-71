
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { InteractiveParticles } from "@/components/InteractiveParticles";
import { LiveTranslation } from "@/components/LiveTranslation";
import { BatteryManager } from "@/components/BatteryManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Zap, Cpu, Shield, Globe, VolumeX } from "lucide-react";
import { VoiceChat } from "@/components/VoiceChat";
import { ImageGenerator } from "@/components/ImageGenerator";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

const Enhanced = () => {
  const [audioVisualization, setAudioVisualization] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [translatedMessage, setTranslatedMessage] = useState("");
  const { theme } = useTheme();

  const handleVoiceStart = () => {
    console.log("Voice recording started");
  };

  const handleVoiceEnd = (transcript: string) => {
    setCurrentMessage(transcript);
  };

  const handleTranslated = (text: string) => {
    setTranslatedMessage(text);
  };

  const toggleAudioVisualization = () => {
    if (!audioVisualization) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setAudioVisualization(true);
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
        });
    } else {
      setAudioVisualization(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Interactive background with particles that react to microphone input */}
      <InteractiveParticles audioEnabled={audioVisualization} />
      
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold"
          >
            Fonctionnalités Avancées
          </motion.h1>
          
          <div className="flex items-center gap-3">
            <LiveTranslation 
              sourceText={currentMessage} 
              onTranslated={handleTranslated}
            />
            <BatteryManager />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu size={20} className="text-primary" />
                Visualisation Audio Interactive
              </CardTitle>
              <CardDescription>
                Interagissez avec les particules de fond en utilisant votre voix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Activez votre microphone pour voir les particules réagir à votre voix en temps réel.
                Les particules s'animeront en fonction de l'intensité et de la fréquence de vos paroles.
              </p>
              <Button 
                variant={audioVisualization ? "default" : "outline"}
                onClick={toggleAudioVisualization}
                className="w-full"
              >
                {audioVisualization ? (
                  <>
                    <VolumeX size={16} className="mr-2" />
                    Désactiver la visualisation audio
                  </>
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    Activer la visualisation audio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-accent" />
                Traduction en Temps Réel
              </CardTitle>
              <CardDescription>
                Communiquez sans barrière de langue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                La traduction automatique détecte la langue de votre message et le traduit instantanément.
                Fonctionne avec la voix et le texte.
              </p>
              
              <div className="space-y-2">
                {currentMessage && (
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-sm font-medium">Message original:</p>
                    <p className="text-sm">{currentMessage}</p>
                  </div>
                )}
                
                {translatedMessage && (
                  <div className="p-2 bg-primary/10 rounded">
                    <p className="text-sm font-medium">Traduction:</p>
                    <p className="text-sm">{translatedMessage}</p>
                  </div>
                )}
                
                <VoiceChat 
                  onVoiceStart={handleVoiceStart}
                  onVoiceEnd={handleVoiceEnd}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Génération d'Images
            </CardTitle>
            <CardDescription>
              Créez des images à partir de descriptions textuelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageGenerator />
          </CardContent>
        </Card>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <p>
            Ces fonctionnalités avancées utilisent les dernières technologies web.
            Certaines fonctionnalités comme la visualisation audio et la détection de batterie
            peuvent ne pas être disponibles sur tous les navigateurs.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Enhanced;
