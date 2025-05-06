/**
 * Clean text content to make it more suitable for speech synthesis
 * by removing markdown syntax, code blocks, and other non-spoken content
 */
export function cleanTextForSpeech(content: string): string {
  if (!content) return '';
  
  // Remove code blocks
  let cleanedContent = content.replace(/```[\s\S]*?```/g, 'code omitted ');
  
  // Remove inline code
  cleanedContent = cleanedContent.replace(/`([^`]+)`/g, '$1');
  
  // Remove markdown links but keep the text
  cleanedContent = cleanedContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove markdown headings syntax
  cleanedContent = cleanedContent.replace(/#{1,6}\s+/g, '');
  
  // Remove markdown bold/italic
  cleanedContent = cleanedContent.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleanedContent = cleanedContent.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove HTML tags
  cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');
  
  // Remove LaTeX equations
  cleanedContent = cleanedContent.replace(/\$\$(.*?)\$\$/g, 'équation mathématique omise');
  cleanedContent = cleanedContent.replace(/\$(.*?)\$/g, 'équation mathématique omise');
  
  // Remove horizontal rules
  cleanedContent = cleanedContent.replace(/---/g, '');
  
  // Remove image descriptions
  cleanedContent = cleanedContent.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  
  // Remove citation syntax like [cite:1]
  cleanedContent = cleanedContent.replace(/\[cite:\d+\]/g, '');
  
  // Add pauses after paragraphs for better speech rhythm
  cleanedContent = cleanedContent.replace(/\.\s+/g, '. ');
  cleanedContent = cleanedContent.replace(/\n{2,}/g, '. ');
  
  // Remove excessive spaces
  cleanedContent = cleanedContent.replace(/\s+/g, ' ');
  
  return cleanedContent.trim();
}

/**
 * Speak text using Web Speech API
 * @returns A function that can be called to stop speaking
 */
export function speakText(text: string): () => void {
  if (!text || !window.speechSynthesis) return () => {};
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to set French voice if available
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(voice => voice.lang.includes('fr'));
  
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }
  
  utterance.lang = 'fr-FR';
  utterance.rate = 1.1;  // Slightly faster than normal
  utterance.pitch = 1.0; // Normal pitch
  
  window.speechSynthesis.speak(utterance);
  
  return () => {
    window.speechSynthesis.cancel();
  };
}

/**
 * Get available speech synthesis voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Check if speech recognition is supported by the browser
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}
