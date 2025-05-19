
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Legal = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">1. Informations légales</h2>
              <p>
                Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site LuvviX les informations suivantes :
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">1.1 Éditeur</h3>
              <p>
                Le site LuvviX est édité par la société LuvviX SAS, au capital social de 100 000 euros, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 123 456 789, dont le siège social est situé au 123 Avenue de l'Innovation, 75001 Paris, France.
              </p>
              <p>
                N° de TVA intracommunautaire : FR 12 345 678 910<br />
                N° de téléphone : +33 1 23 45 67 89<br />
                Adresse e-mail : legal@luvvix.com
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">1.2 Directeur de la publication</h3>
              <p>
                Le Directeur de la publication est Monsieur Jean Dupont, en sa qualité de Président de la société LuvviX SAS.
              </p>
              
              <h3 className="text-xl font-medium mt-6 mb-2">1.3 Hébergeur</h3>
              <p>
                Le site LuvviX est hébergé par la société DigitalOcean LLC, dont le siège social est situé au 101 Avenue of the Americas, 10th Floor, New York, NY 10013, États-Unis.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">2. Propriété intellectuelle</h2>
              <p>
                L'ensemble des éléments constituant le site LuvviX (textes, graphismes, logiciels, photographies, images, sons, plans, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que le site lui-même, relèvent des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle.
              </p>
              <p>
                Ces éléments sont la propriété exclusive de la société LuvviX SAS. La reproduction ou représentation, intégrale ou partielle, des pages, des données et de toute autre élément constitutif du site, par quelque procédé ou support que ce soit, est interdite et constitue sans autorisation expresse et préalable de l'éditeur une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
              </p>
              <p>
                Par exception, certains éléments du site sont librement téléchargeables et peuvent faire l'objet d'une utilisation privée. Cette autorisation d'utilisation ne constitue en aucun cas une cession des droits de propriété intellectuelle.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">3. Données personnelles</h2>
              <p>
                La société LuvviX SAS s'engage à respecter la confidentialité des données personnelles communiquées par l'utilisateur du site et à les traiter dans le respect de la loi Informatique et Libertés n°78-17 du 6 janvier 1978 modifiée et du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l'égard du traitement des données à caractère personnel et à la libre circulation de ces données (RGPD).
              </p>
              <p>
                Pour plus d'informations concernant la collecte et le traitement des données personnelles, veuillez consulter notre <a href="/privacy" className="text-purple-600 hover:text-purple-800">Politique de confidentialité</a>.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">4. Liens hypertextes</h2>
              <p>
                Le site LuvviX peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres sites vous font quitter le site LuvviX.
              </p>
              <p>
                LuvviX SAS n'est pas responsable du contenu des informations fournies sur ces sites après activation d'un lien hypertexte.
              </p>
              <p>
                La création de liens hypertextes vers le site LuvviX est soumise à l'accord préalable de l'éditeur. Pour toute demande, veuillez contacter le directeur de la publication.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation de responsabilité</h2>
              <p>
                LuvviX SAS s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations diffusées sur le site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu. Toutefois, LuvviX SAS ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à la disposition sur le site.
              </p>
              <p>
                En conséquence, LuvviX SAS décline toute responsabilité :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site ;</li>
                <li>pour tous dommages, directs et/ou indirects, quelles qu'en soient les causes, origines, natures ou conséquences, provoqués à raison de l'accès de quiconque au site ou de l'impossibilité d'y accéder ;</li>
                <li>pour tout dommage ou virus qui pourrait infecter l'ordinateur de l'utilisateur ou tout autre matériel à la suite d'une visite ou consultation du site.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Droit applicable et juridiction compétente</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.
              </p>
              <p>
                Pour toute question relative aux présentes mentions légales ou pour toute demande concernant le site, vous pouvez nous contacter à l'adresse email : legal@luvvix.com.
              </p>
              <p className="mt-4">
                Les présentes mentions légales ont été mises à jour le 15 mai 2025.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;
