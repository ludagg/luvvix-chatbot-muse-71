
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add theme CSS variables
const style = document.createElement('style');
style.innerHTML = `
:root {
  --primary-color: 143 141 255;
  --secondary-color: 186 184 255;
}

.theme-purple {
  --primary-color: 168 85 247;
  --secondary-color: 192 132 252;
}

.theme-blue {
  --primary-color: 59 130 246;
  --secondary-color: 96 165 250;
}

.theme-green {
  --primary-color: 34 197 94;
  --secondary-color: 74 222 128;
}
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
