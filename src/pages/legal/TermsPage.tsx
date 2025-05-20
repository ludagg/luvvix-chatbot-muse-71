
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation | LuvviX</title>
        <meta name="description" content="Conditions Générales d'Utilisation des services LuvviX" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-28 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Dernière mise à jour : 20 mai 2025
            </p>
            
            <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation des services 
                fournis par LuvviX. En accédant à nos services ou en les utilisant, vous acceptez d'être lié par ces conditions.
              </p>
            </div>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Définitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>"LuvviX"</strong> ou <strong>"nous"</strong> fait référence à LuvviX SAS, société immatriculée en France.
                </li>
                <li>
                  <strong>"Services"</strong> désigne l'ensemble des produits, applications et fonctionnalités proposés par LuvviX, 
                  y compris LuvviX Forms, LuvviX AI Studio, LuvviX ID, etc.
                </li>
                <li>
                  <strong>"Utilisateur"</strong> ou <strong>"vous"</strong> désigne toute personne qui accède à ou utilise nos Services.
                </li>
                <li>
                  <strong>"Contenu"</strong> désigne toutes les informations, données, textes, images, messages ou autres matériels 
                  que vous soumettez, publiez ou affichez sur ou via nos Services.
                </li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Acceptation des conditions</h2>
              <p className="mb-4">
                En accédant à nos Services ou en les utilisant, vous acceptez d'être lié par les présentes CGU. 
                Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos Services.
              </p>
              <p>
                Nous nous réservons le droit de modifier ces CGU à tout moment. 
                Les modifications entreront en vigueur dès leur publication sur notre site. 
                Il est de votre responsabilité de consulter régulièrement cette page pour rester informé des éventuelles modifications.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Description des services</h2>
              <p className="mb-4">
                LuvviX propose une suite d'applications et de services en ligne, notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>LuvviX Forms</strong> : création et gestion de formulaires en ligne
                </li>
                <li>
                  <strong>LuvviX AI Studio</strong> : création et utilisation d'agents conversationnels alimentés par l'IA
                </li>
                <li>
                  <strong>LuvviX ID</strong> : service d'authentification et de gestion d'identité
                </li>
                <li>
                  <strong>LuvviX News</strong> : agrégateur de nouvelles personnalisées
                </li>
                <li>
                  <strong>LuvviX Weather</strong> : service de prévisions météorologiques
                </li>
                <li>
                  <strong>LuvviX Cloud</strong> : stockage et partage de fichiers en ligne
                </li>
              </ul>
              <p className="mt-4">
                Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie de nos Services 
                à tout moment, avec ou sans préavis.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Création de compte</h2>
              <p className="mb-4">
                Pour utiliser certaines fonctionnalités de nos Services, vous devez créer un compte. 
                Lors de la création d'un compte, vous devez fournir des informations exactes et complètes.
              </p>
              <p className="mb-4">
                Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités 
                qui se produisent sous votre compte. Vous devez nous informer immédiatement de toute utilisation 
                non autorisée de votre compte ou de toute autre violation de sécurité.
              </p>
              <p>
                Nous nous réservons le droit de désactiver tout compte à notre seule discrétion, 
                notamment si nous estimons que vous avez violé ces CGU.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Contenu et propriété intellectuelle</h2>
              <p className="mb-4">
                Vous conservez tous les droits de propriété sur le Contenu que vous soumettez, publiez ou affichez sur ou via nos Services.
              </p>
              <p className="mb-4">
                En soumettant, publiant ou affichant du Contenu sur ou via nos Services, 
                vous nous accordez une licence mondiale, non exclusive, gratuite, transférable et sous-licenciable 
                pour utiliser, reproduire, modifier, adapter, publier, traduire, distribuer et afficher ce Contenu 
                dans le cadre de l'exploitation et de la fourniture de nos Services.
              </p>
              <p>
                Tous les droits, titres et intérêts dans et sur nos Services (à l'exclusion du Contenu fourni par les utilisateurs) 
                sont et resteront la propriété exclusive de LuvviX et de ses concédants de licence.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Limitations de responsabilité</h2>
              <p className="mb-4">
                Nos Services sont fournis "en l'état" et "selon disponibilité", sans garantie d'aucune sorte, 
                expresse ou implicite.
              </p>
              <p className="mb-4">
                Dans toute la mesure permise par la loi applicable, LuvviX ne sera pas responsable des 
                dommages directs, indirects, accidentels, spéciaux, consécutifs ou exemplaires, 
                y compris, mais sans s'y limiter, les dommages pour perte de profits, de clientèle, 
                d'usage, de données ou autres pertes intangibles.
              </p>
              <p>
                Certaines juridictions ne permettent pas l'exclusion de certaines garanties ou la limitation 
                ou l'exclusion de responsabilité pour certains types de dommages. Par conséquent, certaines des 
                limitations ci-dessus peuvent ne pas s'appliquer à vous.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Loi applicable et juridiction</h2>
              <p>
                Les présentes CGU sont régies et interprétées conformément aux lois françaises. 
                Tout litige découlant de ou lié à ces CGU sera soumis à la compétence exclusive des tribunaux de Paris, France.
              </p>
            </section>
            
            <div className="mt-12 border-t pt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pour toute question concernant ces Conditions Générales d'Utilisation, 
                veuillez nous contacter à legal@luvvix.it.com.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TermsPage;
