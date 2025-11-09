import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ParkingProvider } from './context/ParkingContext'
import { LocationProvider } from './context/LocationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ParkingProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </ParkingProvider>
    </AuthProvider>
  </StrictMode>,
)
