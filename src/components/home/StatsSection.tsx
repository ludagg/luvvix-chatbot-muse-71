
import { motion } from "framer-motion";
import { Users, Zap, Shield, Globe } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Utilisateurs actifs",
      description: "Font confiance à LuvviX"
    },
    {
      icon: Zap,
      value: "99.9%",
      label: "Uptime garanti",
      description: "Disponibilité 24/7"
    },
    {
      icon: Shield,
      value: "256-bit",
      label: "Chiffrement",
      description: "Sécurité maximale"
    },
    {
      icon: Globe,
      value: "150+",
      label: "Pays",
      description: "Présence mondiale"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Des résultats qui parlent d'eux-mêmes
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            LuvviX est utilisé par des milliers d'entreprises et d'individus dans le monde entier
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                
                <div className="text-lg font-semibold text-purple-100 mb-1">
                  {stat.label}
                </div>
                
                <div className="text-purple-200 text-sm">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
