
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                La présente politique de confidentialité vous informe sur la façon dont LuvviX SAS utilise et protège les informations que vous nous transmettez lorsque vous utilisez notre site web et nos services.
              </p>
              <p>
                Nous nous engageons à assurer la protection de votre vie privée et de vos données personnelles. Si nous vous demandons de fournir certaines informations permettant de vous identifier lors de l'utilisation de nos services, soyez assuré qu'elles seront utilisées conformément à la présente politique de confidentialité.
              </p>
              <p>
                LuvviX SAS se réserve le droit de modifier cette politique de temps à autre. Nous vous encourageons à consulter régulièrement cette page pour vous tenir informé des mises à jour.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">2. Collecte des données personnelles</h2>
              <p>
                Nous collectons les informations personnelles suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Informations d'identification (nom, prénom, adresse email, etc.)</li>
                <li>Informations professionnelles (entreprise, poste, etc.)</li>
                <li>Informations de paiement (pour les services payants)</li>
                <li>Données d'utilisation de nos services</li>
                <li>Informations techniques (adresse IP, type de navigateur, etc.)</li>
              </ul>
              <p>
                Ces informations sont collectées lorsque vous :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Créez un compte sur notre plateforme</li>
                <li>Utilisez nos services</li>
                <li>Vous abonnez à notre newsletter</li>
                <li>Participez à nos enquêtes ou concours</li>
                <li>Contactez notre service client</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">3. Utilisation des données</h2>
              <p>
                Les données que nous collectons sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Traiter vos paiements</li>
                <li>Vous envoyer des communications marketing (si vous y avez consenti)</li>
                <li>Analyser l'utilisation de nos services</li>
                <li>Détecter et prévenir les fraudes</li>
                <li>Respecter nos obligations légales</li>
              </ul>
              <p>
                Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations avec des prestataires de services tiers qui nous aident à fournir nos services (hébergement, paiement, analyse, etc.), mais ces tiers sont tenus de respecter la confidentialité de vos données.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">4. Cookies et technologies similaires</h2>
              <p>
                Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience sur notre site, analyser notre trafic et personnaliser notre contenu et nos publicités.
              </p>
              <p>
                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site. Ils nous permettent de reconnaître votre appareil et de mémoriser certaines informations sur votre visite.
              </p>
              <p>
                Vous pouvez contrôler et gérer les cookies dans les paramètres de votre navigateur. Veuillez noter que la désactivation de certains cookies peut affecter votre expérience sur notre site et limiter certaines fonctionnalités.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">5. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Ces mesures comprennent :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Le chiffrement des données sensibles</li>
                <li>Des contrôles d'accès stricts</li>
                <li>Des audits de sécurité réguliers</li>
                <li>La formation de notre personnel aux bonnes pratiques de sécurité</li>
              </ul>
              <p>
                Malgré ces précautions, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sûre. Nous ne pouvons donc garantir une sécurité absolue.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">6. Vos droits</h2>
              <p>
                Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification de vos données personnelles</li>
                <li>Droit à l'effacement de vos données personnelles</li>
                <li>Droit à la limitation du traitement de vos données personnelles</li>
                <li>Droit de vous opposer au traitement de vos données personnelles</li>
                <li>Droit à la portabilité de vos données personnelles</li>
                <li>Droit de retirer votre consentement à tout moment</li>
              </ul>
              <p>
                Pour exercer ces droits ou pour toute question concernant le traitement de vos données personnelles, vous pouvez nous contacter à l'adresse : privacy@luvvix.com.
              </p>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente (en France, la CNIL).
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">7. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour atteindre les finalités pour lesquelles nous les avons collectées, y compris pour satisfaire à toute exigence légale, comptable ou de déclaration.
              </p>
              <p>
                Pour déterminer la période de conservation appropriée, nous prenons en compte la quantité, la nature et la sensibilité des données personnelles, le risque potentiel de préjudice résultant d'une utilisation ou d'une divulgation non autorisée, les finalités pour lesquelles nous traitons vos données et si nous pouvons atteindre ces finalités par d'autres moyens.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">8. Transferts internationaux de données</h2>
              <p>
                Nos serveurs sont principalement situés dans l'Union européenne. Cependant, certains de nos prestataires de services peuvent être situés en dehors de l'UE. Dans ce cas, nous nous assurons que des garanties appropriées sont en place pour protéger vos données personnelles, conformément aux exigences du RGPD.
              </p>
              <p>
                Ces garanties peuvent inclure des décisions d'adéquation de la Commission européenne, des clauses contractuelles types ou d'autres mécanismes de transfert appropriés.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications de la politique de confidentialité</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour.
              </p>
              <p>
                En cas de modifications importantes, nous vous informerons par email ou par une notification sur notre site.
              </p>
              <p className="mt-4">
                Cette politique de confidentialité a été mise à jour le 15 mai 2025.
              </p>
              <p className="mt-4">
                Pour toute question concernant cette politique de confidentialité, veuillez nous contacter à privacy@luvvix.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
