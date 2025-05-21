
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
        
        // Always use an absolute URL with the current origin
        const currentOrigin = window.location.origin;
        const absoluteUrl = `${currentOrigin}/ai-embed/${agentId}`;
        
        iframe.src = absoluteUrl;
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
        
        // Setup communication with the iframe
        this.setupCommunication(iframe, agentId);
        
        console.log('LuvviX AI Embed initialized with URL:', iframe.src);
      },
      
      setupCommunication: function(iframe, agentId) {
        // Listen for messages from the iframe
        window.addEventListener('message', function(event) {
          // Check if the message is from our iframe
          if (event.source === iframe.contentWindow) {
            if (event.data.type === 'EMBED_LOADED') {
              // Send initialization message to the iframe
              iframe.contentWindow.postMessage({ 
                type: 'INIT_EMBED',
                agentId: agentId
              }, '*');
            }
            else if (event.data.type === 'EMBED_READY') {
              console.log('Embed is ready to receive messages');
            }
            else if (event.data.type === 'ASSISTANT_RESPONSE') {
              console.log('Received response from assistant:', event.data.message);
              // Here you could handle the response in the parent page if needed
            }
          }
        });
      }
    };
    
    LuvvixEmbed.init();
  });
})();
