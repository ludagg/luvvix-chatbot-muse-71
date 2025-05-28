import React, { useState } from 'react';
import { getAiSocialAssistantResponse } from '../../../services/engagementService'; // Adjust path
// import { createPost } from '../../../services/postService'; // If AI can actually create posts
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path

const AiSocialAssistantWidget = ({ isVisible, onClose }) => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]); // Store a history of prompts and responses
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    const userPrompt = prompt;
    setPrompt(''); // Clear input

    try {
      const aiResponse = await getAiSocialAssistantResponse(userPrompt);
      setResponses(prev => [...prev, { type: 'user', text: userPrompt }, { type: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error("Error getting AI assistant response:", error);
      setResponses(prev => [...prev, { type: 'user', text: userPrompt }, { type: 'ai', text: "Désolé, une erreur s'est produite." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiPost = async () => {
    setIsLoading(true);
    try {
      // Simulate AI generating content for a post
      const aiGeneratedContent = await getAiSocialAssistantResponse("crée un post sur une journée productive"); 
      // The response from getAiSocialAssistantResponse for "crée un post" is just a string confirmation.
      // A real implementation would extract content or have the AI service return structured post data.
      
      // For now, we'll use the confirmation message as the post content.
      // In a real scenario, you'd call `createPost` from `postService`.
      // await createPost({ textContent: aiGeneratedContent, visibility: 'public' }); // Needs mediaFiles array too
      
      alert(`Publication simulée par l'IA :\n"${aiGeneratedContent}"\n\n(Dans une vraie application, cela créerait un vrai post.)`);
      setResponses(prev => [...prev, { type: 'ai', text: `Action de publication simulée : ${aiGeneratedContent}` }]);

    } catch (error) {
      console.error("Error with AI posting:", error);
      alert("Erreur lors de la tentative de publication par l'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[70vh]">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-indigo-600 text-white rounded-t-lg">
        <h3 className="text-md font-semibold">🤖 Assistant Social IA (Simulé)</h3>
        <button onClick={onClose} className="text-indigo-100 hover:text-white text-xl">&times;</button>
      </div>

      {/* Response Area */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-gray-50 min-h-[100px]">
        {responses.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">Posez une question ou donnez une commande à l'assistant. Essayez "aide".</p>
        )}
        {responses.map((res, index) => (
          <div key={index} className={`p-2 rounded-md text-xs ${
            res.type === 'user' ? 'bg-blue-100 text-blue-800 self-end ml-4' : 'bg-indigo-100 text-indigo-800 self-start mr-4'
          }`}>
            <span className="font-bold capitalize">{res.type === 'user' ? (currentUser?.displayName || 'Vous') : 'Assistant IA'}: </span>
            {res.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmitPrompt} className="p-3 border-t border-gray-200">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Suggère un ami..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          rows="2"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitPrompt(e);
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
            <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="py-1.5 px-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-xs font-medium disabled:opacity-60"
            >
                {isLoading ? 'Pensée...' : 'Envoyer'}
            </button>
             <button
                type="button"
                onClick={handleAiPost}
                disabled={isLoading}
                className="py-1.5 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs font-medium disabled:opacity-60"
                title="L'IA génère un post simple et le publie (simulé)."
            >
                Laisser l'IA Publier
            </button>
        </div>
      </form>
    </div>
  );
};

export default AiSocialAssistantWidget;
