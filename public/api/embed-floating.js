
(function() {
  window.addEventListener('load', function() {
    const settings = window.luvvixSettings || {};
    const agentId = settings.agentId;
    
    if (!agentId) {
      console.error('LuvviX: Missing agent ID in settings');
      return;
    }
    
    const LuvvixFloating = {
      position: settings.position || 'bottom-right',
      theme: settings.theme || 'dark',
      isOpen: false,
      buttonElement: null,
      widgetElement: null,
      iframeElement: null,
      
      init: function() {
        this.createButton();
        this.createWidget();
      },
      
      createButton: function() {
        const button = document.createElement('button');
        button.id = 'luvvix-floating-button';
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        
        // Position styles
        const posStyles = {
          'bottom-right': 'bottom: 20px; right: 20px;',
          'bottom-left': 'bottom: 20px; left: 20px;',
          'top-right': 'top: 20px; right: 20px;',
          'top-left': 'top: 20px; left: 20px;'
        };
        
        // Theme styles
        const themeStyles = {
          'dark': 'background-color: #7c3aed; color: white;',
          'light': 'background-color: white; color: #7c3aed; border: 1px solid #7c3aed;'
        };
        
        button.style.cssText = `
          ${posStyles[this.position]};
          ${themeStyles[this.theme]};
          position: fixed;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 99998;
          transition: all 0.3s ease;
        `;
        
        button.addEventListener('click', () => this.toggleWidget());
        document.body.appendChild(button);
        this.buttonElement = button;
      },
      
      createWidget: function() {
        const widget = document.createElement('div');
        widget.id = 'luvvix-floating-widget';
        
        // Position styles based on button position
        const posStyles = {
          'bottom-right': 'bottom: 90px; right: 20px;',
          'bottom-left': 'bottom: 90px; left: 20px;',
          'top-right': 'top: 90px; right: 20px;',
          'top-left': 'top: 90px; left: 20px;'
        };
        
        widget.style.cssText = `
          ${posStyles[this.position]};
          position: fixed;
          width: 350px;
          height: 500px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 99997;
          overflow: hidden;
          display: none;
          transition: all 0.3s ease;
        `;
        
        // Create iframe with absolute URL
        const iframe = document.createElement('iframe');
        const currentOrigin = window.location.origin;
        const absoluteUrl = `${currentOrigin}/ai-embed/${agentId}`;
        
        iframe.src = absoluteUrl;
        iframe.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
        `;
        
        // Setup communication with the iframe
        window.addEventListener('message', (event) => {
          if (event.source === iframe.contentWindow) {
            if (event.data.type === 'EMBED_LOADED') {
              // Send initialization message to the iframe
              iframe.contentWindow.postMessage({ 
                type: 'INIT_EMBED',
                agentId: agentId
              }, '*');
            }
          }
        });
        
        widget.appendChild(iframe);
        document.body.appendChild(widget);
        this.widgetElement = widget;
        this.iframeElement = iframe;
        
        console.log('LuvviX AI Floating widget initialized with URL:', iframe.src);
      },
      
      toggleWidget: function() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
          this.widgetElement.style.display = 'block';
          setTimeout(() => {
            this.widgetElement.style.opacity = '1';
            this.buttonElement.style.transform = 'rotate(45deg)';
          }, 10);
        } else {
          this.widgetElement.style.opacity = '0';
          this.buttonElement.style.transform = 'rotate(0)';
          setTimeout(() => {
            this.widgetElement.style.display = 'none';
          }, 300);
        }
      },
      
      sendMessage: function(message) {
        if (this.iframeElement && this.iframeElement.contentWindow) {
          this.iframeElement.contentWindow.postMessage({
            type: 'USER_MESSAGE',
            message: message
          }, '*');
        }
      }
    };
    
    // Expose the API to the global scope
    window.LuvvixAI = {
      open: function() {
        if (!LuvvixFloating.isOpen) {
          LuvvixFloating.toggleWidget();
        }
      },
      close: function() {
        if (LuvvixFloating.isOpen) {
          LuvvixFloating.toggleWidget();
        }
      },
      sendMessage: function(message) {
        if (!LuvvixFloating.isOpen) {
          LuvvixFloating.toggleWidget();
        }
        LuvvixFloating.sendMessage(message);
      }
    };
    
    LuvvixFloating.init();
  });
})();
