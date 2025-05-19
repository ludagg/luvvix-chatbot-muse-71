
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data for the blog post
  const post = {
    title: "L'avenir du travail : collaboration homme-machine",
    content: `
      <p>Dans un monde où l'intelligence artificielle évolue à une vitesse fulgurante, la collaboration homme-machine n'est plus une vision futuriste, mais une réalité quotidienne pour de nombreuses entreprises. Chez LuvviX, nous sommes aux premières loges pour observer cette transformation profonde du lieu de travail.</p>
      
      <h2>Une nouvelle ère de productivité</h2>
      
      <p>Les systèmes d'IA comme LuvviX AI Studio ne sont pas conçus pour remplacer les travailleurs humains, mais pour amplifier leurs capacités. Ils permettent d'automatiser les tâches répétitives et chronophages, libérant ainsi du temps pour la créativité, l'innovation et la résolution de problèmes complexes.</p>
      
      <p>Nos clients rapportent régulièrement des gains de productivité de 30 à 50% après l'intégration d'agents IA dans leurs flux de travail. Cette efficacité accrue se traduit non seulement par une meilleure rentabilité, mais aussi par une satisfaction professionnelle accrue, les employés pouvant se concentrer sur des aspects plus gratifiants de leur travail.</p>
      
      <h2>Compétences pour l'avenir</h2>
      
      <p>Cette révolution technologique redéfinit les compétences nécessaires sur le marché du travail. Les compétences techniques restent importantes, mais les "soft skills" deviennent cruciales : pensée critique, créativité, intelligence émotionnelle et capacité à collaborer efficacement avec les systèmes d'IA.</p>
      
      <p>L'éducation et la formation continue sont essentielles pour naviguer dans ce paysage en évolution rapide. Les entreprises qui investissent dans le développement des compétences de leur personnel seront les mieux positionnées pour prospérer.</p>
      
      <blockquote>
        "L'avenir n'appartient pas aux machines, ni aux humains seuls, mais à ceux qui savent orchestrer intelligemment cette collaboration." - Claire Dupont, Directrice de l'Innovation chez LuvviX
      </blockquote>
      
      <h2>Défis éthiques et sociétaux</h2>
      
      <p>Cette transformation soulève d'importantes questions éthiques : équité des algorithmes, protection de la vie privée, transparence dans la prise de décision automatisée. Chez LuvviX, nous prenons ces défis au sérieux et travaillons activement à développer des systèmes d'IA responsables.</p>
      
      <p>Les politiques publiques joueront également un rôle crucial pour garantir que les bénéfices de cette révolution soient largement partagés et que personne ne soit laissé de côté.</p>
      
      <h2>Vers un avenir collaboratif</h2>
      
      <p>Notre vision chez LuvviX est celle d'un avenir où l'IA amplifie l'ingéniosité humaine, où les machines gèrent les tâches routinières pendant que les humains se concentrent sur l'innovation, l'empathie et la créativité.</p>
      
      <p>Les entreprises qui embrassent cette vision de collaboration homme-machine seront celles qui définiront les industries de demain. Êtes-vous prêt à faire partie de cette révolution?</p>
    `,
    author: "Nicolas Bernard",
    authorTitle: "Directeur Recherche & Développement",
    authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "20 Avril 2025",
    readTime: "8 min de lecture",
    category: "Tendances",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=600&fit=crop"
  };
  
  // Mock related articles
  const relatedArticles = [
    {
      id: 3,
      title: "Créez des agents IA personnalisés en 5 minutes",
      category: "Tutoriel",
      image: "https://images.unsplash.com/photo-1675271092010-5ca13b7e9d99?w=300&h=200&fit=crop"
    },
    {
      id: 1,
      title: "Révolution de l'IA : comment LuvviX transforme le développement",
      category: "Intelligence Artificielle",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Les meilleures pratiques pour sécuriser vos applications IA",
      category: "Sécurité",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <article>
          {/* Hero Section */}
          <div className="relative">
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
            
            <div className="container mx-auto px-4">
              <div className="relative -mt-32 bg-white rounded-t-xl p-8 max-w-4xl mx-auto shadow-lg">
                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                  {post.category}
                </div>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                  {post.title}
                </h1>
                <div className="mt-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={post.authorImage} 
                      alt={post.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium">{post.author}</p>
                    <p className="text-sm text-gray-500">
                      {post.authorTitle} • {post.date} • {post.readTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Article Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-b-xl shadow-lg">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
              
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={post.authorImage} 
                      alt={post.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium text-lg">{post.author}</p>
                    <p className="text-gray-600">{post.authorTitle}</p>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-600">
                  Nicolas dirige l'équipe R&D de LuvviX et possède plus de 15 ans d'expérience dans le développement de solutions d'IA. Il est passionné par l'intersection de la technologie et de l'expérience utilisateur.
                </p>
              </div>
            </div>
            
            {/* Related Articles */}
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                    <Link to={`/blog/${article.id}`}>
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-40 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                        {article.category}
                      </div>
                      <Link to={`/blog/${article.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition">
                          {article.title}
                        </h3>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour au blog
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
