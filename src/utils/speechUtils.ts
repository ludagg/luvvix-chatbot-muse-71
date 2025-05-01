
/**
 * Lit un texte à voix haute en utilisant l'API Speech Synthesis
 * @param text Le texte à lire
 * @param lang La langue de lecture (défaut: fr-FR)
 * @param rate La vitesse de lecture (défaut: 1)
 * @param pitch La hauteur de la voix (défaut: 1)
 * @returns Une fonction pour arrêter la lecture
 */
export const speakText = (text: string, lang = 'fr-FR', rate = 1, pitch = 1): (() => void) => {
  // Vérifier si l'API est disponible
  if (!('speechSynthesis' in window)) {
    console.error('La synthèse vocale n\'est pas supportée par ce navigateur.');
    return () => {};
  }

  // Arrêter toute lecture en cours
  window.speechSynthesis.cancel();

  // Créer une nouvelle instance de SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configurer les paramètres
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  
  // Trouver la meilleure voix disponible pour la langue
  const voices = window.speechSynthesis.getVoices();
  const voicesForLanguage = voices.filter(voice => voice.lang.startsWith(lang.split('-')[0]));
  
  if (voicesForLanguage.length > 0) {
    // Préférer une voix féminine si disponible
    const femaleVoice = voicesForLanguage.find(voice => voice.name.includes('female') || voice.name.includes('Female'));
    utterance.voice = femaleVoice || voicesForLanguage[0];
  }

  // Lancer la lecture
  window.speechSynthesis.speak(utterance);
  
  // Fonction pour arrêter la lecture
  return () => {
    window.speechSynthesis.cancel();
  };
};

/**
 * Nettoie le texte Markdown pour la synthèse vocale
 * @param markdown Le texte Markdown à nettoyer
 * @returns Le texte nettoyé
 */
export const cleanTextForSpeech = (markdown: string): string => {
  let text = markdown;
  
  // Supprimer les sections de code
  text = text.replace(/```[\s\S]*?```/g, "code supprimé pour la synthèse vocale. ");
  
  // Supprimer les liens Markdown mais garder le texte
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  
  // Supprimer les images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  
  // Remplacer les titres par du texte simple
  text = text.replace(/#+\s+(.*?)$/gm, "$1. ");
  
  // Supprimer les formatages gras et italiques
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  
  // Supprimer les listes à puces et numérotées
  text = text.replace(/^\s*[-*+]\s+(.*?)$/gm, "$1. ");
  text = text.replace(/^\s*\d+\.\s+(.*?)$/gm, "$1. ");
  
  // Supprimer les tableaux
  text = text.replace(/^\|.*\|$/gm, "");
  text = text.replace(/^[|:-]+$/gm, "");
  
  // Supprimer les sections "Sources:" et tout ce qui suit
  text = text.replace(/\n\n\*?Sources:[\s\S]*$/i, "");
  
  // Supprimer la signature LuvviX
  text = text.replace(/\n\n\*— LuvviX.*?\*$/g, "");
  
  // Remplacer les sauts de ligne multiples par un seul
  text = text.replace(/\n{2,}/g, ". ");
  
  // Remplacer les sauts de ligne simples par des espaces
  text = text.replace(/\n/g, " ");
  
  // Supprimer les espaces multiples
  text = text.replace(/\s{2,}/g, " ");
  
  return text.trim();
};
