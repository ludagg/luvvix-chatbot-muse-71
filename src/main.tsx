
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/use-theme';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </LanguageProvider>
);
