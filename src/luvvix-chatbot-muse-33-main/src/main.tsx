
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Cette fonction est maintenant conditionnelle
// Elle sera appelée uniquement si la page est chargée directement
const renderApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
};

// Exporter le composant App pour qu'il puisse être utilisé comme module
export default App;

// Seulement rendre si ce fichier est chargé directement (pas comme module)
if (import.meta.url === document.currentScript?.getAttribute("src")) {
  renderApp();
}
