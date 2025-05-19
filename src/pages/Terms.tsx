
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (ci-après dénommées "CGU") régissent l'utilisation du site web LuvviX et des services associés (ci-après dénommés "Services") fournis par la société LuvviX SAS, au capital social de 100 000 euros, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 123 456 789, dont le siège social est situé au 123 Avenue de l'Innovation, 75001 Paris, France (ci-après dénommée "LuvviX").
              </p>
              <p>
                L'utilisation des Services implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces CGU, vous ne devez pas utiliser les Services.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">2. Définitions</h2>
              <p>
                Dans les présentes CGU, les termes suivants ont la signification qui leur est attribuée ci-dessous :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li><strong>"Utilisateur"</strong> : toute personne physique ou morale qui utilise les Services.</li>
                <li><strong>"Compte"</strong> : espace personnel créé par l'Utilisateur sur le site pour accéder aux Services.</li>
                <li><strong>"Contenu"</strong> : ensemble des éléments (textes, images, vidéos, etc.) publiés sur le site par LuvviX ou par les Utilisateurs.</li>
                <li><strong>"Données Personnelles"</strong> : informations permettant d'identifier directement ou indirectement un Utilisateur.</li>
                <li><strong>"Services"</strong> : ensemble des fonctionnalités proposées par LuvviX aux Utilisateurs.</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">3. Accès aux Services</h2>
              <h3 className="text-xl font-medium mt-6 mb-2">3.1 Conditions d'accès</h3>
              <p>
                Pour accéder aux Services, l'Utilisateur doit disposer d'un accès à Internet. Les frais de connexion au réseau Internet sont à la charge de l'Utilisateur.
              </p>
              <p>
                Certains Services sont accessibles uniquement après création d'un Compte. Pour créer un Compte, l'Utilisateur doit être une personne physique majeure ou une personne morale dûment représentée.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">3.2 Création d'un compte</h3>
              <p>
                Lors de la création d'un Compte, l'Utilisateur s'engage à fournir des informations exactes, complètes et à jour. L'Utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toutes les activités effectuées depuis son Compte.
              </p>
              <p>
                L'Utilisateur s'engage à informer immédiatement LuvviX de toute utilisation non autorisée de son Compte ou de toute autre violation de sécurité.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">3.3 Suspension et résiliation</h3>
              <p>
                LuvviX se réserve le droit, à sa seule discrétion, de suspendre ou de résilier l'accès d'un Utilisateur aux Services, sans préavis ni indemnité, en cas de violation des présentes CGU ou pour tout autre motif légitime.
              </p>
              <p>
                L'Utilisateur peut à tout moment résilier son Compte en suivant la procédure prévue à cet effet sur le site.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">4. Description des Services</h2>
              <p>
                LuvviX propose une plateforme permettant de créer, personnaliser et déployer des agents d'intelligence artificielle pour divers usages professionnels et personnels.
              </p>
              <p>
                Les Services comprennent notamment :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>La création et la personnalisation d'agents IA</li>
                <li>L'intégration d'agents IA dans divers environnements (sites web, applications, etc.)</li>
                <li>L'accès à une marketplace d'agents IA</li>
                <li>Des outils d'analyse et de suivi des performances</li>
                <li>Des fonctionnalités de collaboration et de partage</li>
              </ul>
              <p>
                LuvviX se réserve le droit de modifier, d'ajouter ou de supprimer certaines fonctionnalités des Services, à tout moment et sans préavis.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">5. Obligations de l'Utilisateur</h2>
              <p>
                Dans le cadre de l'utilisation des Services, l'Utilisateur s'engage à :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Respecter les présentes CGU et toutes les lois et réglementations applicables</li>
                <li>Ne pas porter atteinte aux droits des tiers (droits de propriété intellectuelle, droit à l'image, droit au respect de la vie privée, etc.)</li>
                <li>Ne pas publier de contenu illicite, diffamatoire, injurieux, raciste, xénophobe, incitant à la haine ou à la violence</li>
                <li>Ne pas utiliser les Services à des fins frauduleuses ou malveillantes</li>
                <li>Ne pas tenter de perturber le fonctionnement normal des Services</li>
                <li>Ne pas collecter des informations sur les autres Utilisateurs sans leur consentement</li>
                <li>Ne pas utiliser les Services pour envoyer des messages non sollicités (spam)</li>
              </ul>
              <p>
                En cas de non-respect de ces obligations, LuvviX se réserve le droit de suspendre ou de résilier l'accès de l'Utilisateur aux Services et de prendre toutes les mesures appropriées, y compris des actions en justice.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
              <h3 className="text-xl font-medium mt-6 mb-2">6.1 Droits de LuvviX</h3>
              <p>
                L'ensemble des éléments constituant les Services (textes, graphismes, logiciels, photographies, images, sons, plans, logos, marques, etc.) sont protégés par les droits de propriété intellectuelle. Ils sont la propriété exclusive de LuvviX ou de ses partenaires.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle des Services ou de leur contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est strictement interdite sans l'autorisation préalable et écrite de LuvviX.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">6.2 Droits de l'Utilisateur</h3>
              <p>
                L'Utilisateur conserve tous les droits de propriété intellectuelle sur les contenus qu'il publie sur les Services. En publiant un contenu, l'Utilisateur accorde à LuvviX une licence non exclusive, mondiale, gratuite, cessible et sous-licenciable pour utiliser, reproduire, modifier, adapter, publier et distribuer ce contenu dans le cadre des Services.
              </p>
              <p>
                L'Utilisateur garantit à LuvviX qu'il dispose de tous les droits nécessaires pour publier son contenu et accorder la licence susmentionnée.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
              <p>
                LuvviX s'efforce d'assurer la disponibilité et le bon fonctionnement des Services. Toutefois, LuvviX ne peut garantir que les Services seront accessibles sans interruption et que leur fonctionnement sera exempt d'erreurs.
              </p>
              <p>
                LuvviX ne saurait être tenue responsable :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Des interruptions ou dysfonctionnements des Services</li>
                <li>De l'impossibilité d'accéder aux Services due à des problèmes de connexion Internet</li>
                <li>Des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser les Services</li>
                <li>Du contenu publié par les Utilisateurs</li>
                <li>Des actions ou omissions des autres Utilisateurs</li>
              </ul>
              <p>
                En tout état de cause, la responsabilité de LuvviX est limitée aux dommages directs, à l'exclusion de tout dommage indirect (perte de données, perte de chiffre d'affaires, perte de clientèle, etc.).
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">8. Protection des données personnelles</h2>
              <p>
                LuvviX s'engage à respecter la vie privée des Utilisateurs et à traiter leurs données personnelles conformément à la réglementation applicable, notamment le Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (RGPD) et la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés.
              </p>
              <p>
                Pour plus d'informations sur la collecte et le traitement des données personnelles, veuillez consulter notre <a href="/privacy" className="text-purple-600 hover:text-purple-800">Politique de confidentialité</a>.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Dispositions diverses</h2>
              <h3 className="text-xl font-medium mt-6 mb-2">9.1 Modification des CGU</h3>
              <p>
                LuvviX se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur le site. L'Utilisateur est invité à consulter régulièrement les CGU.
              </p>
              <p>
                En cas de modification substantielle des CGU, LuvviX en informera les Utilisateurs par tout moyen approprié.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">9.2 Nullité partielle</h3>
              <p>
                Si une ou plusieurs stipulations des présentes CGU sont tenues pour non valides ou déclarées comme telles en application d'une loi, d'un règlement ou à la suite d'une décision définitive d'une juridiction compétente, les autres stipulations garderont toute leur force et leur portée.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">9.3 Loi applicable et juridiction compétente</h3>
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes CGU, les tribunaux français seront seuls compétents.
              </p>
              <p>
                Avant d'engager une procédure judiciaire, l'Utilisateur s'engage à rechercher une solution amiable avec LuvviX.
              </p>
              
              <p className="mt-10">
                Les présentes Conditions Générales d'Utilisation ont été mises à jour le 15 mai 2025.
              </p>
              <p className="mt-4">
                Pour toute question concernant ces CGU, veuillez nous contacter à legal@luvvix.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
