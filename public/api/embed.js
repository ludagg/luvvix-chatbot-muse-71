
(function() {
  // Find all agent elements
  const scriptTag = document.currentScript;
  const containerId = scriptTag.getAttribute('data-container-id') || 'luvvix-ai-container';
  const agentId = scriptTag.getAttribute('data-agent-id');
  const theme = scriptTag.getAttribute('data-theme') || 'light';
  const accentColor = scriptTag.getAttribute('data-accent-color') || '#6366f1';
  const hideCredit = scriptTag.getAttribute('data-hide-credit') === 'true';
  const startMessage = scriptTag.getAttribute('data-start-message') || '';
  
  // Find the container element
  const findContainerId = (id) => {
    if (id.startsWith('#')) {
      id = id.substring(1);
    }
    return id;
  };
  
  const container = document.getElementById(findContainerId(containerId)) || 
                    document.querySelector(`[data-agent-id="${agentId}"]`) ||
                    scriptTag.previousElementSibling;
  
  if (!container) {
    console.error('LuvviX AI: Container element not found');
    return;
  }
  
  if (!agentId) {
    container.innerHTML = 'LuvviX AI: Agent ID is required';
    return;
  }
  
  // Create iframe
  const iframe = document.createElement('iframe');
  
  // Set iframe attributes
  iframe.src = `https://luvvix.it.com/ai-embed/${agentId}?theme=${theme}&accentColor=${encodeURIComponent(accentColor)}${hideCredit ? '&hideCredit=true' : ''}${startMessage ? `&startMessage=${encodeURIComponent(startMessage)}` : ''}`;
  iframe.style.width = '100%';
  iframe.style.height = '600px';
  iframe.style.border = '1px solid #e5e7eb';
  iframe.style.borderRadius = '0.5rem';
  iframe.setAttribute('title', 'LuvviX AI Chat');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('allowTransparency', 'true');
  
  // Clear container and append iframe
  container.innerHTML = '';
  container.appendChild(iframe);
})();
