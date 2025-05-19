
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, HeartPulse, Radio, ArrowRight, Send, Search, Calendar } from "lucide-react";

const ProductDemos = () => {
  // For AI Chat Demo
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Bonjour! Comment puis-je vous aider aujourd\'hui?' }
  ]);

  // For search demo
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setChatMessages([...chatMessages, { sender: 'user', text: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: "Je comprends votre demande. LuvviX AI peut vous aider à analyser ces données et créer un rapport automatisé avec des visualisations pertinentes. Souhaitez-vous que je vous montre un exemple?"
        }
      ]);
    }, 1000);

    setMessage('');
  };

  return (
    <section id="products" className="container-padding bg-gradient-to-b from-white to-luvvix-lightgray">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">Nos Produits</h2>
        <p className="section-subheading">
          Découvrez nos solutions innovantes à travers ces démonstrations interactives
        </p>

        <div className="mt-12">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain size={16} />
                <span className="hidden sm:inline">LuvviX AI</span>
              </TabsTrigger>
              <TabsTrigger value="medic" className="flex items-center gap-2">
                <HeartPulse size={16} />
                <span className="hidden sm:inline">LuvviX Medic</span>
              </TabsTrigger>
              <TabsTrigger value="stream" className="flex items-center gap-2">
                <Radio size={16} />
                <span className="hidden sm:inline">LuvviX StreamMix</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="border-none outline-none">
              <Card className="max-w-2xl mx-auto shadow-lg">
                <CardContent className="p-0">
                  <div className="bg-luvvix-purple p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain size={20} className="text-white" />
                        <h3 className="text-white font-medium">LuvviX AI Assistant</h3>
                      </div>
                      <div className="flex gap-2">
                        {['bg-red-500', 'bg-yellow-400', 'bg-green-500'].map((bg, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${bg}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-80 overflow-y-auto p-4 bg-white">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.sender === 'user'
                              ? 'bg-luvvix-purple text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Écrivez votre message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" className="bg-luvvix-purple hover:bg-luvvix-darkpurple">
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center mt-8">
                <Button className="bg-luvvix-purple hover:bg-luvvix-darkpurple">
                  Découvrir LuvviX AI
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="medic" className="border-none outline-none">
              <Card className="max-w-2xl mx-auto shadow-lg">
                <CardContent className="p-0">
                  <div className="bg-emerald-500 p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartPulse size={20} className="text-white" />
                        <h3 className="text-white font-medium">LuvviX Medic Find</h3>
                      </div>
                      <div className="flex gap-2">
                        {['bg-red-500', 'bg-yellow-400', 'bg-green-500'].map((bg, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${bg}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white space-y-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Rechercher un spécialiste, une spécialité..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {[
                        {
                          name: "Dr. Sophie Martin",
                          specialty: "Cardiologie",
                          rating: 4.9,
                          distance: "2.3 km"
                        },
                        {
                          name: "Dr. Thomas Bernard",
                          specialty: "Médecine générale",
                          rating: 4.7,
                          distance: "1.5 km"
                        },
                        {
                          name: "Dr. Claire Dubois",
                          specialty: "Dermatologie",
                          rating: 4.8,
                          distance: "3.1 km"
                        }
                      ].map((doctor, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{doctor.name}</h4>
                              <p className="text-sm text-gray-500">{doctor.specialty}</p>
                              <div className="flex items-center mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs ml-1 text-gray-600">{doctor.rating}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-xs text-gray-600">{doctor.distance}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="hidden sm:flex">
                                <Calendar size={14} className="mr-1" /> 
                                RDV
                              </Button>
                              <Button size="sm">Profil</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center mt-8">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Découvrir LuvviX Medic
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="stream" className="border-none outline-none">
              <Card className="max-w-2xl mx-auto shadow-lg">
                <CardContent className="p-0">
                  <div className="bg-orange-500 p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio size={20} className="text-white" />
                        <h3 className="text-white font-medium">LuvviX StreamMix</h3>
                      </div>
                      <div className="flex gap-2">
                        {['bg-red-500', 'bg-yellow-400', 'bg-green-500'].map((bg, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${bg}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 text-white">
                    <div className="p-2 border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="p-1 rounded hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-1 rounded hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-1 rounded hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm">StreamMix Studio v1.0</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="aspect-w-16 aspect-h-9 bg-black mb-4 rounded overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                          <div className="h-full w-1/3 bg-orange-500"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Audio Source</h4>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Video Source</h4>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Timeline</h4>
                        <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-700">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-32 h-12 bg-gray-700 rounded overflow-hidden relative">
                              <div className={`absolute inset-0 ${['bg-blue-500/20', 'bg-green-500/20', 'bg-purple-500/20', 'bg-yellow-500/20', 'bg-red-500/20'][i % 5]}`}></div>
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                                <div className={`h-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'][i % 5]}`} style={{ width: `${30 + i * 15}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center mt-8">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Découvrir LuvviX StreamMix
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ProductDemos;
