
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col flex-grow pt-16 pb-6"
      >
        <div className="flex-1 w-full max-w-5xl mx-auto px-4">
          <ChatContainer />
        </div>
      </motion.main>
    </div>
  );
};

export default Index;
