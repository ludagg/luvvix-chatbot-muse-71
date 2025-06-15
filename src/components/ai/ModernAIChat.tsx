
import React, { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import ImageUploader from "./ImageUploader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  createdAt: Date;
};

const ModernAIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour 👋 ! Je peux comprendre le texte **et** les images. Déposez une image ou tapez votre message !",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Preview the image selected
  React.useEffect(() => {
    if (!selectedImage) return setPreviewUrl(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string || null);
    reader.readAsDataURL(selectedImage);
    return () => reader.abort();
  }, [selectedImage]);

  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim() && !selectedImage) return;
    if (!user) return toast.error("Connectez-vous pour chatter !");

    const msgObj: ChatMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      imageUrl: previewUrl ?? undefined,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, msgObj]);
    setInput("");
    setIsTyping(true);

    // Envoi à l’edge function (multimodal)
    const formData = new FormData();
    formData.append("message", input.trim());
    if (selectedImage) formData.append("image", selectedImage);

    setSelectedImage(null);
    setPreviewUrl(null);

    try {
      const res = await fetch("/functions/v1/gemini-chat-response", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Erreur réponse Gemini");
      }
      const { response, responseImage } = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          role: "assistant",
          content: response,
          imageUrl: responseImage || undefined,
          createdAt: new Date(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "fail",
          role: "assistant",
          content: "Désolé, je n’ai pas pu obtenir de réponse 🤖💔.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-8">
      <Card className="w-full max-w-xl shadow-2xl p-0 rounded-2xl border-0 bg-white/80 dark:bg-gray-900/90">
        {/* Chat history */}
        <div className="flex flex-col gap-3 p-5 pb-2 h-[550px] overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl shadow ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-gradient-to-r from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-200"
                }`}
              >
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt="Image envoyée"
                    className="rounded shadow mb-2 max-w-xs border"
                  />
                )}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end gap-2 animate-pulse">
              <div className="max-w-[78%] px-4 py-3 rounded-2xl shadow bg-gradient-to-r from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-300 opacity-70">
                Assistant rédige...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
        {/* Input area : multiline, image uploader à gauche, send à droite */}
        <form
          className="flex items-end w-full gap-3 px-5 pb-5 bg-transparent pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <ImageUploader
            previewUrl={previewUrl}
            onImageSelected={setSelectedImage}
            disabled={isTyping}
          />
          <textarea
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[48px] max-h-[120px] transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            disabled={isTyping}
            placeholder="Envoyez un message ou ajoutez une image (entrée pour valider)…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white flex items-center justify-center h-12 w-12 text-lg shadow-lg transition"
            disabled={isTyping || (!input.trim() && !selectedImage)}
            aria-label="Envoyer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ModernAIChat;
