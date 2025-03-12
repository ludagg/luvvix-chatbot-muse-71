
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-10 border-b border-primary/20 neo-blur"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-gradient-to-br from-primary/90 to-primary/50",
              "text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25"
            )}>
              L
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-medium text-gradient">LuvviX AI</h1>
            <p className="text-xs text-muted-foreground">Votre assistant personnel</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
