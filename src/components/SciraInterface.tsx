
import { useState } from "react";
import { Globe, Clock, Calendar, Paperclip, ArrowUp, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

export function SciraInterface() {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    {text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", isUser: false}
  ]);

  const { register, handleSubmit, reset } = useForm<{message: string}>();

  const suggestedQuestions = [
    "What are popular French cultural traditions?",
    "How does French cuisine influence global food trends?",
    "What historical events shaped modern France?"
  ];

  const onSubmit = (data: {message: string}) => {
    if (data.message.trim()) {
      // Add user message
      setMessages(prev => [...prev, {text: data.message, isUser: true}]);
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          {text: "Je suis désolé, je suis juste une démonstration d'interface et ne peux pas vraiment répondre à cette question.", isUser: false}
        ]);
      }, 1000);
      
      reset();
    }
  };

  const sendSuggestedQuestion = (question: string) => {
    onSubmit({message: question});
  };

  const getCurrentTimeAndDate = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const date = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return { time, date };
  };

  const { time, date } = getCurrentTimeAndDate();

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 1 && (
          <>
            <h1 className="text-3xl font-medium mt-20 mb-6">What do you want to explore?</h1>
            <div className="space-y-2 mb-8">
              {suggestedQuestions.map((question, index) => (
                <button 
                  key={index}
                  className="scira-question-button"
                  onClick={() => sendSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <div className="scira-date-chip">
                <Clock size={16} />
                <span>{time}</span>
              </div>
              <div className="scira-date-chip">
                <Calendar size={16} />
                <span>{date}</span>
              </div>
            </div>
          </>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              message.isUser 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-white rounded-bl-none'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex items-center bg-gray-800 rounded-full w-full p-1">
            <button type="button" className="p-2 rounded-full hover:bg-gray-700">
              <Globe size={20} className="text-gray-400" />
            </button>
            
            <input
              {...register("message")}
              className="flex-1 bg-transparent border-none focus:outline-none text-white px-3 py-2"
              placeholder="Ask a question..."
              autoComplete="off"
            />
            
            <button type="button" className="p-2 rounded-full hover:bg-gray-700">
              <Paperclip size={20} className="text-gray-400" />
            </button>
            
            <button 
              type="submit" 
              className="bg-blue-600 p-2 rounded-full hover:bg-blue-700"
            >
              <ArrowUp size={20} className="text-white" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
