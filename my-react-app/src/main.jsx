import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx' // Adjusted path
import { CallProvider } from './contexts/CallContext.jsx' // Import CallProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CallProvider> {/* CallProvider is inside AuthProvider to access useAuth */}
        <App />
      </CallProvider>
    </AuthProvider>
  </StrictMode>,
)
