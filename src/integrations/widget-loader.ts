
/**
 * Ce fichier s'occupe de charger les widgets LuvviX seulement quand la page est chargée
 * et offre une API pour initialiser manuellement les widgets
 */

const loadScripts = () => {
  // Recherche des widgets standards
  const containers = document.querySelectorAll('[id^="luvvix-ai-"]');
  if (containers.length > 0) {
    loadScript('/api/embed.js');
  }

  // Recherche des boutons popup
  const buttons = document.querySelectorAll('#luvvix-ai-button');
  if (buttons.length > 0) {
    loadScript('/api/embed-popup.js');
  }

  // Recherche de paramètres pour le widget flottant
  if (window.luvvixSettings && window.luvvixSettings.agentId) {
    loadScript('/api/embed-floating.js');
  }
};

const loadScript = (src: string) => {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
};

// API publique
window.LuvvixWidget = {
  init: loadScripts,
};

// Chargement automatique des widgets lors du chargement de la page
window.addEventListener('load', loadScripts);

// Déclaration de type pour window
declare global {
  interface Window {
    luvvixSettings?: {
      agentId?: string;
      position?: string;
      theme?: string;
    };
    LuvvixWidget: {
      init: () => void;
    };
  }
}

export {};
