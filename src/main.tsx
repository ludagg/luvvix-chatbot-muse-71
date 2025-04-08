
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
  --primary: 168 85 247;
  --primary-foreground: 255 255 255;
  --accent: 192 132 252;
  --accent-foreground: 255 255 255;
  --ring: 168 85 247;
}

.theme-blue {
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --accent: 96 165 250;  
  --accent-foreground: 255 255 255;
  --ring: 59 130 246;
}

.theme-green {
  --primary: 34 197 94;
  --primary-foreground: 255 255 255;
  --accent: 74 222 128;
  --accent-foreground: 255 255 255;
  --ring: 34 197 94;
}
`;
document.head.appendChild(style);

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
const root = document.documentElement;

// Apply theme classes on initial load
root.classList.remove('light', 'dark', 'theme-purple', 'theme-blue', 'theme-green');
if (savedTheme === 'purple') {
  root.classList.add('dark', 'theme-purple');
} else if (savedTheme === 'blue') {
  root.classList.add('dark', 'theme-blue');
} else if (savedTheme === 'green') {
  root.classList.add('dark', 'theme-green');
} else {
  root.classList.add(savedTheme);
}

createRoot(document.getElementById("root")!).render(<App />);
