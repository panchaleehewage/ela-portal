import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@asgardeo/auth-react'
import App from './App.jsx'
import './index.css'

const authConfig = {
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL || "http://localhost:5173",
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL || "http://localhost:5173",
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
  scope: ["openid", "profile", "groups", "roles"]
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider config={authConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)