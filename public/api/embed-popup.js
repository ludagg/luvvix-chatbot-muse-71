
(function() {
  window.addEventListener('load', function() {
    const LuvvixPopup = {
      init: function() {
        const buttons = document.querySelectorAll('#luvvix-ai-button');
        buttons.forEach(button => {
          const agentId = button.getAttribute('data-agent-id');
          if (agentId) {
            button.addEventListener('click', () => this.openPopup(agentId));
          }
        });
      },
      
      openPopup: function(agentId) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        // Create popup
        const popup = document.createElement('div');
        popup.style.width = '80%';
        popup.style.maxWidth = '500px';
        popup.style.height = '600px';
        popup.style.backgroundColor = 'white';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        popup.style.position = 'relative';
        popup.style.overflow = 'hidden';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '2';
        closeBtn.style.color = '#666';
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(overlay);
        });
        
        // Create iframe
        const iframe = document.createElement('iframe');
        // Utilisation du chemin absolu pour éviter les erreurs 404
        iframe.src = `${window.location.origin}/ai-embed/${agentId}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        
        popup.appendChild(closeBtn);
        popup.appendChild(iframe);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
      }
    };
    
    LuvvixPopup.init();
  });
})();
