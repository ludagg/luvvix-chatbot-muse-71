
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Mail, 
  User, 
  ArrowRight, 
  Twitter, 
  Linkedin, 
  Github, 
  Youtube, 
  Instagram, 
  Facebook, 
  Shield, 
  FileText, 
  Info, 
  HelpCircle, 
  Phone
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-luvvix-purple to-luvvix-teal inline-block text-transparent bg-clip-text">LuvviX</span>
            </Link>
            <p className="text-gray-400 mb-6">
              LuvviX Technologies crée des solutions innovantes à l'intersection de l'intelligence artificielle, 
              de la santé numérique et des médias pour construire un futur plus intelligent et plus humain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Produits</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/ai-studio" className="hover:text-white transition-colors flex items-center gap-1"><Bot size={14} /> LuvviX AI</Link></li>
              <li><Link to="/medecine" className="hover:text-white transition-colors flex items-center gap-1"><Shield size={14} /> LuvviX Medic</Link></li>
              <li><Link to="/streammix" className="hover:text-white transition-colors flex items-center gap-1"><Youtube size={14} /> LuvviX StreamMix</Link></li>
              <li><Link to="/cloud" className="hover:text-white transition-colors flex items-center gap-1"><Cloud size={14} /> LuvviX Cloud</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors flex items-center gap-1"><User size={14} /> LuvviX ID</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Ressources</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/docs" className="hover:text-white transition-colors flex items-center gap-1"><FileText size={14} /> Documentation</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors flex items-center gap-1"><HelpCircle size={14} /> Centre d'aide</Link></li>
              <li><Link to="/api-docs" className="hover:text-white transition-colors flex items-center gap-1"><FileText size={14} /> API Reference</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-1"><FileText size={14} /> Blog</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors flex items-center gap-1"><Calendar size={14} /> Événements</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-1"><Info size={14} /> À propos</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors flex items-center gap-1"><Briefcase size={14} /> Carrières</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors flex items-center gap-1"><Handshake size={14} /> Partenaires</Link></li>
              <li><Link to="/investors" className="hover:text-white transition-colors flex items-center gap-1"><TrendingUp size={14} /> Investisseurs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1"><Phone size={14} /> Contact</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1"><Shield size={14} /> Confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1"><FileText size={14} /> CGU</Link></li>
              <li><Link to="/licenses" className="hover:text-white transition-colors flex items-center gap-1"><FileCheck size={14} /> Licences</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors flex items-center gap-1"><Cookie size={14} /> Cookies</Link></li>
              <li><Link to="/compliance" className="hover:text-white transition-colors flex items-center gap-1"><CheckSquare size={14} /> Conformité</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-gray-400 text-sm">
              © 2023 LuvviX Technologies. Tous droits réservés.
            </div>
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
                <span className="text-sm text-gray-400">Restez informé</span>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="Votre email" 
                      className="pl-10 py-2 bg-gray-800 border-gray-700 text-white w-full md:w-56"
                    />
                  </div>
                  <Button className="ml-2 bg-luvvix-purple hover:bg-luvvix-darkpurple">
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
