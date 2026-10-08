import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { DialogProvider } from './context/DialogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </AuthProvider>
  </StrictMode>,
)
