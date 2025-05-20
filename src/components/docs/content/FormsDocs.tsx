
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FormsDocs = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">LuvviX Forms</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Créez des formulaires élégants, collectez des réponses et analysez les données facilement.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Créer un formulaire</h2>
        <p>
          LuvviX Forms vous permet de créer des formulaires personnalisés pour recueillir des informations, 
          réaliser des sondages, organiser des événements et plus encore.
        </p>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium">Étapes pour créer un formulaire</h3>
          </div>
          <div className="p-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>Accédez à <a href="/forms" className="text-violet-600 dark:text-violet-400 hover:underline">LuvviX Forms</a>.</li>
              <li>Cliquez sur "Créer un formulaire".</li>
              <li>Ajoutez un titre et une description à votre formulaire.</li>
              <li>Ajoutez des questions en utilisant le bouton "Ajouter une question".</li>
              <li>Personnalisez chaque question (type, options, paramètres).</li>
              <li>Organisez vos questions par glisser-déposer.</li>
              <li>Personnalisez l'apparence de votre formulaire.</li>
              <li>Cliquez sur "Enregistrer" puis "Publier" pour le rendre accessible.</li>
            </ol>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Types de questions</h2>
        <p>
          LuvviX Forms propose de nombreux types de questions pour recueillir différentes formes de données.
        </p>
        
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="text">Texte</TabsTrigger>
            <TabsTrigger value="choice">Choix</TabsTrigger>
            <TabsTrigger value="rating">Évaluation</TabsTrigger>
            <TabsTrigger value="special">Spécial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Texte court</h3>
                <p className="text-sm mb-3">
                  Pour les réponses brèves comme un nom, une adresse e-mail ou un numéro de téléphone.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Quel est votre nom ?</div>
                  <input type="text" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" placeholder="Votre réponse" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Paragraphe</h3>
                <p className="text-sm mb-3">
                  Pour les réponses longues comme des commentaires ou des descriptions.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Parlez-nous de votre expérience</div>
                  <textarea className="w-full p-2 border rounded h-20 dark:bg-gray-800 dark:border-gray-700" placeholder="Votre réponse"></textarea>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="choice" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Choix unique</h3>
                <p className="text-sm mb-3">
                  Pour sélectionner une seule option parmi plusieurs choix.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Quel est votre secteur d'activité ?</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="tech" name="industry" className="mr-2" />
                      <label htmlFor="tech">Technologie</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="finance" name="industry" className="mr-2" />
                      <label htmlFor="finance">Finance</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="health" name="industry" className="mr-2" />
                      <label htmlFor="health">Santé</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Cases à cocher</h3>
                <p className="text-sm mb-3">
                  Pour sélectionner plusieurs options parmi une liste.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Quels produits utilisez-vous ? (plusieurs choix possibles)</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="product1" className="mr-2" />
                      <label htmlFor="product1">LuvviX Forms</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="product2" className="mr-2" />
                      <label htmlFor="product2">LuvviX AI Studio</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="product3" className="mr-2" />
                      <label htmlFor="product3">LuvviX ID</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rating" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Échelle linéaire</h3>
                <p className="text-sm mb-3">
                  Pour évaluer sur une échelle numérique de 1 à N.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">À quel point recommanderiez-vous nos services ?</div>
                  <div className="flex justify-between">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <input type="radio" name="rating" className="mr-1" />
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="rating" className="mr-1" />
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="rating" className="mr-1" />
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="rating" className="mr-1" />
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="rating" className="mr-1" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Pas du tout</span>
                    <span>Tout à fait</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Étoiles</h3>
                <p className="text-sm mb-3">
                  Pour évaluer avec un système d'étoiles.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Comment évalueriez-vous notre service client ?</div>
                  <div className="flex">
                    <span className="text-xl text-yellow-500 cursor-pointer">★</span>
                    <span className="text-xl text-yellow-500 cursor-pointer">★</span>
                    <span className="text-xl text-yellow-500 cursor-pointer">★</span>
                    <span className="text-xl text-gray-300 cursor-pointer dark:text-gray-600">★</span>
                    <span className="text-xl text-gray-300 cursor-pointer dark:text-gray-600">★</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Date</h3>
                <p className="text-sm mb-3">
                  Pour collecter une date ou une heure.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Quelle est votre date de naissance ?</div>
                  <input type="date" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Téléchargement de fichier</h3>
                <p className="text-sm mb-3">
                  Pour collecter des fichiers auprès des répondants.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                  <div className="mb-2 font-medium">Veuillez télécharger votre CV</div>
                  <button className="px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors">
                    Parcourir...
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Partage et collecte</h2>
        <p>
          Une fois votre formulaire créé, vous disposez de plusieurs options pour le partager et collecter des réponses.
        </p>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium">Options de partage</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Lien direct</strong> - Partagez un lien vers votre formulaire par e-mail, message ou sur les réseaux sociaux.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Code QR</strong> - Générez un code QR que les utilisateurs peuvent scanner avec leur téléphone.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Intégration</strong> - Intégrez le formulaire directement sur votre site web ou blog.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 rounded-full bg-violet-600 mt-1 mr-2"></span>
                <span><strong>Préfiltrage</strong> - Créez des liens pré-remplis pour certains champs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Analyse des réponses</h2>
        <p>
          LuvviX Forms vous offre des outils puissants pour analyser les réponses collectées.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Visualisation en temps réel</h3>
            <p className="text-sm">
              Suivez les réponses à mesure qu'elles arrivent et visualisez les données via des graphiques générés automatiquement.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Export de données</h3>
            <p className="text-sm">
              Exportez les réponses au format CSV ou Excel pour une analyse plus approfondie avec d'autres outils.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Filtrage avancé</h3>
            <p className="text-sm">
              Filtrez les réponses selon différents critères pour approfondir votre analyse.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Réponses individuelles</h3>
            <p className="text-sm">
              Consultez les réponses individuelles pour une analyse détaillée de chaque soumission.
            </p>
          </div>
        </div>
      </section>
      
      <section className="bg-violet-50 dark:bg-violet-900/10 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Prêt à créer votre formulaire ?</h2>
        <p className="mb-4">
          Commencez à créer des formulaires élégants et fonctionnels dès maintenant avec LuvviX Forms.
        </p>
        <a
          href="/forms/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Créer un formulaire
        </a>
      </section>
    </div>
  );
};

export default FormsDocs;
