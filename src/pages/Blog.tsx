
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Révolution de l'IA : comment LuvviX transforme le développement",
      excerpt: "Découvrez comment notre plateforme d'IA change la façon dont les entreprises développent et déploient des applications.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      category: "Intelligence Artificielle",
      author: "Sophie Martin",
      date: "12 Mai 2025",
    },
    {
      id: 2,
      title: "5 façons d'optimiser votre productivité avec nos outils",
      excerpt: "Apprenez à tirer le meilleur parti de la suite d'outils LuvviX pour révolutionner votre flux de travail.",
      image: "https://images.unsplash.com/photo-1661956602868-6ae368943878",
      category: "Productivité",
      author: "Thomas Dubois",
      date: "5 Mai 2025",
    },
    {
      id: 3,
      title: "Créez des agents IA personnalisés en 5 minutes",
      excerpt: "Guide pas-à-pas pour créer rapidement des agents IA performants adaptés à vos besoins spécifiques.",
      image: "https://images.unsplash.com/photo-1675271092010-5ca13b7e9d99",
      category: "Tutoriel",
      author: "Émilie Rousseau",
      date: "28 Avril 2025",
    },
    {
      id: 4,
      title: "L'avenir du travail : collaboration homme-machine",
      excerpt: "Comment l'intelligence artificielle transforme nos méthodes de travail et crée de nouvelles opportunités.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      category: "Tendances",
      author: "Nicolas Bernard",
      date: "20 Avril 2025",
    },
    {
      id: 5,
      title: "Les meilleures pratiques pour sécuriser vos applications IA",
      excerpt: "Découvrez les techniques essentielles pour protéger vos données et applications d'IA contre les cybermenaces.",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7",
      category: "Sécurité",
      author: "Claire Dupont",
      date: "15 Avril 2025",
    },
    {
      id: 6,
      title: "Comment nous avons optimisé notre infrastructure pour l'IA",
      excerpt: "Notre équipe technique partage son expérience sur la mise à l'échelle de notre infrastructure pour l'IA.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      category: "Tech",
      author: "Alexandre Moreau",
      date: "8 Avril 2025",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog LuvviX</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Découvrez les dernières tendances, tutoriels et actualités sur l'IA, 
              le développement et l'innovation technologique.
            </p>
          </div>
        </div>
        
        {/* Featured Article */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg mb-12">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485" 
                  alt="Featured article" 
                  className="h-64 md:h-full w-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">À la une</div>
                <Link to="/blog/4" className="block mt-2">
                  <h2 className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition">
                    L'avenir du travail : collaboration homme-machine
                  </h2>
                </Link>
                <p className="mt-3 text-gray-600">
                  Comment l'intelligence artificielle transforme nos méthodes de travail et crée de nouvelles opportunités. 
                  Découvrez comment les entreprises avant-gardistes intègrent déjà ces technologies pour rester compétitives.
                </p>
                <div className="mt-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Nicolas Bernard"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Nicolas Bernard</p>
                    <p className="text-sm text-gray-500">20 Avril 2025 · 8 min de lecture</p>
                  </div>
                </div>
                <Link 
                  to="/blog/4" 
                  className="mt-6 inline-flex items-center text-purple-600 hover:text-purple-800"
                >
                  Lire l'article
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
                <Link to={`/blog/${post.id}`}>
                  <img 
                    src={`${post.image}?w=600&h=400&fit=crop`}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                </Link>
                <div className="p-6">
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                    {post.category}
                  </div>
                  <Link to={`/blog/${post.id}`}>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900 hover:text-purple-600 transition">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{post.author}</p>
                      <p className="text-gray-500">{post.date}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/blog/${post.id}`}
                    className="mt-4 inline-block text-sm text-purple-600 hover:text-purple-800"
                  >
                    Lire la suite
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                1
              </button>
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
