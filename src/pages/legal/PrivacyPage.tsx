
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PrivacyPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <>
      <Helmet>
        <title>Politique de confidentialité | LuvviX</title>
        <meta name="description" content="Politique de confidentialité de LuvviX - Comment nous protégeons vos données" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-28 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Politique de confidentialité</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Dernière mise à jour : 20 mai 2025
            </p>
            
            <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Chez LuvviX, nous prenons la protection de vos données personnelles très au sérieux. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
                lorsque vous utilisez nos services.
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="collection">Collecte de données</TabsTrigger>
                <TabsTrigger value="usage">Utilisation</TabsTrigger>
                <TabsTrigger value="rights">Vos droits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="mb-4">
                    La présente politique de confidentialité s'applique à tous les produits et services proposés par LuvviX, 
                    y compris LuvviX Forms, LuvviX AI Studio, LuvviX ID, etc.
                  </p>
                  <p>
                    Nous sommes engagés à protéger votre vie privée et à traiter vos données personnelles de manière 
                    transparente et conforme au Règlement Général sur la Protection des Données (RGPD) et 
                    autres lois applicables sur la protection des données.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Responsable du traitement</h2>
                  <p>
                    LuvviX SAS est responsable du traitement des données personnelles collectées via nos services.
                    Pour toute question concernant la protection de vos données, vous pouvez nous contacter à l'adresse suivante:
                    <br /><br />
                    <strong>LuvviX SAS</strong><br />
                    123 Avenue de la Technologie<br />
                    75001 Paris, France<br />
                    Email: privacy@luvvix.it.com
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="collection" className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Données que nous collectons</h2>
                  <p className="mb-4">Nous pouvons collecter les types de données suivants :</p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Données d'identification :</strong> nom, prénom, adresse email, nom d'utilisateur
                    </li>
                    <li>
                      <strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation, 
                      informations sur l'appareil
                    </li>
                    <li>
                      <strong>Données d'utilisation :</strong> interactions avec nos services, préférences, 
                      contenu généré par l'utilisateur
                    </li>
                    <li>
                      <strong>Données de localisation :</strong> pays, région (avec votre consentement)
                    </li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Cookies et technologies similaires</h2>
                  <p>
                    Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, 
                    analyser l'utilisation de nos services et personnaliser le contenu. 
                    Pour plus d'informations, veuillez consulter notre <a href="/cookies" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Politique relative aux cookies</a>.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="usage" className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Comment nous utilisons vos données</h2>
                  <p className="mb-4">Nous utilisons vos données personnelles pour :</p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fournir et améliorer nos services</li>
                    <li>Personnaliser votre expérience</li>
                    <li>Communiquer avec vous concernant nos services</li>
                    <li>Assurer la sécurité de nos services</li>
                    <li>Respecter nos obligations légales</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Partage des données</h2>
                  <p className="mb-4">
                    Nous ne vendons pas vos données personnelles. Nous pouvons partager vos données avec :
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nos prestataires de services qui nous aident à fournir nos services</li>
                    <li>Les autorités publiques lorsque la loi l'exige</li>
                    <li>Des tiers avec votre consentement explicite</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Conservation des données</h2>
                  <p>
                    Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services, 
                    respecter nos obligations légales ou protéger nos intérêts légitimes. 
                    Lorsque vos données ne sont plus nécessaires, nous les supprimons ou les anonymisons.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="rights" className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
                  <p className="mb-4">Conformément aux lois applicables sur la protection des données, vous avez le droit de :</p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accéder à vos données personnelles</li>
                    <li>Rectifier vos données personnelles</li>
                    <li>Supprimer vos données personnelles</li>
                    <li>Limiter le traitement de vos données personnelles</li>
                    <li>Vous opposer au traitement de vos données personnelles</li>
                    <li>Demander la portabilité de vos données personnelles</li>
                    <li>Retirer votre consentement à tout moment</li>
                  </ul>
                  
                  <p className="mt-4">
                    Pour exercer ces droits, veuillez nous contacter à privacy@luvvix.it.com. 
                    Nous nous efforcerons de répondre à votre demande dans un délai d'un mois.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Modifications de la politique de confidentialité</h2>
                  <p>
                    Nous pouvons modifier cette politique de confidentialité de temps à autre. 
                    La version la plus récente sera toujours disponible sur notre site web. 
                    Nous vous encourageons à consulter régulièrement cette page pour rester informé des éventuelles modifications.
                  </p>
                </section>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 border-t pt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pour toute question concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, 
                veuillez nous contacter à privacy@luvvix.it.com.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPage;
