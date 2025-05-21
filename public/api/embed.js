
(function() {
  window.addEventListener('load', function() {
    const LuvvixEmbed = {
      init: function() {
        const containers = document.querySelectorAll('[id^="luvvix-ai-"]');
        containers.forEach(container => {
          const agentId = container.id.replace('luvvix-ai-', '');
          this.createIframe(container, agentId);
        });
      },
      
      createIframe: function(container, agentId) {
        const iframe = document.createElement('iframe');
        // Correction de l'URL pour utiliser le domaine du site actuel
        iframe.src = `${window.location.protocol}//${window.location.host}/ai-embed/${agentId}`;
        iframe.width = '100%';
        iframe.height = '600px';
        iframe.style.border = '1px solid #e5e7eb';
        iframe.style.borderRadius = '0.5rem';
        iframe.style.backgroundColor = 'transparent';
        iframe.title = 'LuvviX AI Assistant';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('allowtransparency', 'true');
        
        // Clear container and append iframe
        container.innerHTML = '';
        container.appendChild(iframe);
      }
    };
    
    LuvvixEmbed.init();
  });
})();
