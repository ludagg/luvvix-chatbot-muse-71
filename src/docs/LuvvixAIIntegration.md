
# Guide d'intégration de LuvviX AI avec LuvviX ID

Ce document explique comment intégrer votre application LuvviX AI externe avec le système d'authentification LuvviX ID, permettant aux utilisateurs de se connecter avec leur compte LuvviX ID existant.

## Principe de l'intégration

L'intégration est basée sur un système de tokens OAuth simplifié :

1. L'utilisateur se connecte au portail central LuvviX et génère un token d'intégration temporaire
2. L'utilisateur est redirigé vers votre application avec ce token
3. Votre application vérifie la validité du token auprès de l'API LuvviX ID
4. Si le token est valide, votre application crée ou récupère le compte utilisateur correspondant
5. Votre application établit une session authentifiée pour l'utilisateur

## Installation du script d'intégration

Ajoutez le script d'intégration dans l'entête de votre application :

```html
<script src="https://luvvix.it.com/api/luvvix-auth-integration.js"></script>
```

## Configuration dans votre application

Créez les routes suivantes dans votre application :

### 1. Route `/auth/luvvix`

Cette route reçoit le token LuvviX ID et vérifie sa validité :

```javascript
// Exemple avec Express.js
app.get('/auth/luvvix', (req, res) => {
  // Le script d'intégration s'occupera de traiter cette route automatiquement
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connexion LuvviX ID</title>
        <script src="/api/luvvix-auth-integration.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            LuvvixAuthIntegration.init();
          });
        </script>
      </head>
      <body>
        <h1>Connexion en cours...</h1>
        <p>Veuillez patienter pendant que nous vérifions votre connexion.</p>
      </body>
    </html>
  `);
});
```

### 2. Route `/auth/callback`

Cette route reçoit le résultat de l'authentification :

```javascript
// Exemple avec Express.js
app.get('/auth/callback', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentification terminée</title>
        <script src="/api/luvvix-auth-integration.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            LuvvixAuthIntegration.init();
            
            // Écouter l'événement de connexion réussie
            window.addEventListener('luvvix_login', function(e) {
              const user = e.detail.user;
              console.log('Utilisateur connecté:', user);
              
              // Rediriger vers la page d'accueil après un court délai
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            });
            
            // Vérifier s'il y a une erreur
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            if (error) {
              document.getElementById('error-message').textContent = error;
              document.getElementById('error-container').style.display = 'block';
            }
          });
        </script>
      </head>
      <body>
        <h1>Authentification terminée</h1>
        <p>Vous êtes maintenant connecté avec votre compte LuvviX ID.</p>
        
        <div id="error-container" style="display: none; color: red; padding: 10px; background-color: #ffeeee; border: 1px solid red; margin-top: 20px;">
          <h2>Erreur d'authentification</h2>
          <p id="error-message"></p>
          <p><a href="/">Retour à l'accueil</a></p>
        </div>
      </body>
    </html>
  `);
});
```

## Utilisation dans votre application

Une fois l'intégration configurée, vous pouvez utiliser les fonctions suivantes :

```javascript
// Initialiser l'intégration
LuvvixAuthIntegration.init({
  // Options de configuration personnalisées si nécessaire
});

// Vérifier si l'utilisateur est authentifié
const isLoggedIn = LuvvixAuthIntegration.isAuthenticated();

// Obtenir les informations de l'utilisateur
const user = LuvvixAuthIntegration.getUser();

// Déconnecter l'utilisateur
LuvvixAuthIntegration.logout();

// Écouter les événements d'authentification
window.addEventListener('luvvix_login', function(e) {
  console.log('Utilisateur connecté:', e.detail.user);
});

window.addEventListener('luvvix_logout', function() {
  console.log('Utilisateur déconnecté');
});
```

## Sécurité

Quelques recommandations de sécurité pour l'intégration :

1. Utilisez toujours HTTPS pour toutes les communications
2. Vérifiez toujours la validité des tokens auprès de l'API LuvviX ID
3. Ne stockez jamais le token dans les cookies sans protection appropriée
4. Utilisez des sessions côté serveur pour une sécurité optimale
5. Les tokens ont une durée de validité limitée (1 heure), ne pas les stocker de façon permanente

## Support technique

Pour toute question concernant l'intégration, contactez l'équipe LuvviX ID à l'adresse : support@luvvix.it.com
