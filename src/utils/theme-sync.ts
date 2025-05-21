
/**
 * Synchronize the theme between the main application and LuvvixAI
 */
export function syncThemeWithLuvvixAI(theme: string): void {
  try {
    // Store the theme preference in localStorage so it can be accessed by the iframe
    localStorage.setItem('luvvix-ai-theme', theme);
    
    // If there's an iframe with LuvvixAI, we can try to communicate with it
    const aiFrame = document.querySelector('iframe[src*="luvvix-ai"]') as HTMLIFrameElement;
    
    if (aiFrame && aiFrame.contentWindow) {
      // Send a message to the iframe to update its theme
      aiFrame.contentWindow.postMessage(
        { 
          type: 'THEME_CHANGE', 
          theme 
        },
        '*'
      );
    }
  } catch (error) {
    console.error('Failed to sync theme with LuvvixAI:', error);
  }
}

/**
 * Listen for theme changes from LuvvixAI
 */
export function listenForThemeChanges(setTheme: (theme: string) => void): () => void {
  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'THEME_CHANGE') {
      setTheme(event.data.theme);
    }
  };
  
  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
