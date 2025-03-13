
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-background/90">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10%] opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <Header />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col flex-grow pt-20 pb-6 relative z-10"
      >
        <div className="flex-1 w-full max-w-5xl mx-auto px-4">
          <ChatContainer />
        </div>
      </motion.main>
      
      {/* Modern footer with gradient */}
      <div className="relative z-10 py-3 text-center text-xs text-muted-foreground bg-gradient-to-t from-background/80 to-transparent">
        <p>© {new Date().getFullYear()} LuvviX AI · Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Index;
