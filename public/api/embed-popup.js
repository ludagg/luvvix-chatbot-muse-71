
(function() {
  // Get configuration from the button
  const buttons = document.querySelectorAll('[data-agent-id]');
  
  if (buttons.length === 0) {
    console.error('LuvviX AI: No agent button found');
    return;
  }
  
  // Process each button found on the page
  buttons.forEach(button => {
    const agentId = button.getAttribute('data-agent-id');
    const theme = button.getAttribute('data-theme') || 'light';
    const accentColor = button.getAttribute('data-accent-color') || '#6366f1';
    const hideCredit = button.getAttribute('data-hide-credit') === 'true';
    const startMessage = button.getAttribute('data-start-message') || '';
    
    // Style the button if it doesn't have custom styling
    if (!button.hasAttribute('style') && !button.classList.length) {
      button.style.backgroundColor = accentColor;
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.padding = '8px 16px';
      button.style.cursor = 'pointer';
      button.style.fontFamily = 'system-ui, sans-serif';
      button.style.fontSize = '14px';
    }
    
    // Add click event listener to show popup
    button.addEventListener('click', () => {
      // Create popup container
      const popup = document.createElement('div');
      popup.style.position = 'fixed';
      popup.style.bottom = '20px';
      popup.style.right = '20px';
      popup.style.width = '350px';
      popup.style.height = '500px';
      popup.style.backgroundColor = theme === 'dark' ? '#1a1f2c' : 'white';
      popup.style.borderRadius = '8px';
      popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      popup.style.zIndex = '10000';
      popup.style.overflow = 'hidden';
      popup.style.display = 'flex';
      popup.style.flexDirection = 'column';
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://luvvix.it.com/ai-embed/${agentId}?theme=${theme}&accentColor=${encodeURIComponent(accentColor)}${hideCredit ? '&hideCredit=true' : ''}${startMessage ? `&startMessage=${encodeURIComponent(startMessage)}` : ''}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.setAttribute('title', 'LuvviX AI Chat');
      
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.background = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '20px';
      closeButton.style.color = theme === 'dark' ? 'white' : '#1a1f2c';
      closeButton.style.cursor = 'pointer';
      closeButton.style.zIndex = '10001';
      
      // Add close event
      closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
      });
      
      // Add elements to popup
      popup.appendChild(iframe);
      popup.appendChild(closeButton);
      
      // Add popup to page
      document.body.appendChild(popup);
    });
  });
})();
