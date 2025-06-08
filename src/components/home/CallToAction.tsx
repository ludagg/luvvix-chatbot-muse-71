
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
              Prêt à transformer votre
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                expérience numérique ?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              Rejoignez des milliers d'utilisateurs qui ont déjà choisi LuvviX 
              pour simplifier et sécuriser leur écosystème digital.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/auth?signup=true">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Commencer maintenant
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/ecosystem">
              <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                Explorer nos solutions
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 text-blue-200 text-sm"
          >
            <p>Gratuit pendant 30 jours • Aucune carte de crédit requise • Support 24/7</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
