import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/store'
import { AuthProvider } from './context/AuthContext'
import { ParkingProvider } from './context/ParkingContext'
import { LocationProvider } from './context/LocationContext'
import { GoogleMapsProvider } from './context/GoogleMapsContext'
import { loadUserFromStorage } from './store/slices/authSlice'

const AppWithRedux = () => {
  useEffect(() => {
    store.dispatch(loadUserFromStorage());
  }, []);

  return (
    <GoogleMapsProvider>
      <AuthProvider>
        <ParkingProvider>
          <LocationProvider>
            <App />
          </LocationProvider>
        </ParkingProvider>
      </AuthProvider>
    </GoogleMapsProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWithRedux />
    </Provider>
  </StrictMode>,
)
