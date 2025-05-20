
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CookiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Politique relative aux cookies | LuvviX</title>
        <meta name="description" content="Informations sur l'utilisation des cookies par LuvviX" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-28 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Politique relative aux cookies</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Dernière mise à jour : 20 mai 2025
            </p>
            
            <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cette politique relative aux cookies explique comment LuvviX et ses partenaires utilisent les cookies 
                et technologies similaires pour reconnaître votre visite et suivre votre activité lorsque vous utilisez nos services.
              </p>
            </div>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte qui est stocké sur votre ordinateur ou autre appareil mobile 
                lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web 
                ou les rendre plus efficaces, ainsi que pour fournir des informations aux propriétaires du site.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Comment utilisons-nous les cookies ?</h2>
              <p className="mb-4">
                Nous utilisons différents types de cookies pour les finalités suivantes :
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Cookies essentiels</h3>
                  <p className="text-sm">
                    Ces cookies sont nécessaires au fonctionnement de nos services. Ils vous permettent de naviguer sur notre site 
                    et d'utiliser ses fonctionnalités, comme l'accès aux zones sécurisées.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Cookies de performance</h3>
                  <p className="text-sm">
                    Ces cookies nous permettent de compter les visites et les sources de trafic afin de mesurer et d'améliorer 
                    les performances de notre site. Ils nous aident à savoir quelles pages sont les plus et les moins populaires.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Cookies de fonctionnalité</h3>
                  <p className="text-sm">
                    Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation de notre site. 
                    Ils peuvent être définis par nous ou par des fournisseurs tiers dont nous avons ajouté les services à nos pages.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Cookies de ciblage</h3>
                  <p className="text-sm">
                    Ces cookies peuvent être définis par nos partenaires publicitaires via notre site. 
                    Ils peuvent être utilisés par ces sociétés pour établir un profil de vos intérêts 
                    et vous proposer des publicités pertinentes sur d'autres sites.
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Quels types de cookies utilisons-nous ?</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700">
                      <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Nom</th>
                      <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Fournisseur</th>
                      <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Finalité</th>
                      <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">session</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">LuvviX</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Maintient votre session utilisateur</td>
                      <td className="p-3">Session</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">theme</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">LuvviX</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Stocke vos préférences de thème</td>
                      <td className="p-3">1 an</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">_ga</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Google Analytics</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Distingue les utilisateurs</td>
                      <td className="p-3">2 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">_gid</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Google Analytics</td>
                      <td className="p-3 border-r border-gray-200 dark:border-gray-600">Distingue les utilisateurs</td>
                      <td className="p-3">24 heures</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Comment contrôler les cookies ?</h2>
              <p className="mb-4">
                Vous pouvez contrôler et gérer les cookies de plusieurs façons. Veuillez noter que la suppression 
                ou le blocage des cookies peut affecter votre expérience utilisateur et certaines parties de nos services 
                peuvent ne plus être entièrement accessibles.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Paramètres du navigateur</h3>
              <p className="mb-4">
                La plupart des navigateurs web vous permettent de contrôler la plupart des cookies via leurs paramètres. 
                Pour en savoir plus sur la façon de gérer les cookies avec votre navigateur, consultez les liens suivants :
              </p>
              
              <ul className="list-disc pl-6 space-y-1 mb-6">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300">Safari</a></li>
                <li><a href="https://support.microsoft.com/fr-fr/windows/supprimer-et-g%C3%A9rer-les-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300">Microsoft Edge</a></li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">Outils de gestion des cookies</h3>
              <p>
                Vous pouvez également gérer vos préférences en matière de cookies via notre outil de gestion des cookies, 
                accessible via le bouton "Gérer les cookies" présent en bas de notre site.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Modifications de la politique relative aux cookies</h2>
              <p>
                Nous pouvons mettre à jour cette politique relative aux cookies de temps à autre. 
                La version la plus récente sera toujours disponible sur notre site web. 
                Nous vous encourageons à consulter régulièrement cette page pour rester informé des éventuelles modifications.
              </p>
            </section>
            
            <div className="mt-12 border-t pt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pour toute question concernant notre utilisation des cookies, veuillez nous contacter à privacy@luvvix.it.com.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CookiesPage;
