
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Settings, HelpCircle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-10 border-b border-primary/10 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-gradient-to-br from-primary via-primary/80 to-primary/60",
              "text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25"
            )}>
              L
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-medium bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">LuvviX AI</h1>
            <p className="text-xs text-muted-foreground">Votre assistant IA personnel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <HelpCircle size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings size={18} />
          </Button>
          <Button variant="outline" size="sm" className="gap-2 ml-2 text-xs font-medium">
            <UserCircle size={14} />
            <span>Compte</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
