import React, { useState, useEffect } from 'react';
import api from './api/axios';
import Chatbot from './components/ui/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Costos from './pages/Costos';
import Checkout from './pages/Checkout';
import Contacto from './pages/Contacto';
import Historial from './pages/Historial';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(3);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  setUser(null);
  setIsPremium(false);
  setCredits(3);
  setCurrentView('home');
};

useEffect(() => {
  const loadUserProfile = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) return;

    try {
      const response = await api.get('/profile/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const profileData = response.data;

      setUser({
        name: profileData.first_name
          ? `${profileData.first_name} ${profileData.last_name}`
          : profileData.username,
        email: profileData.email
      });

      setIsPremium(profileData.is_premium);
      setCredits(profileData.creditos);

    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsPremium(false);
      setCredits(3);
    }
  };

  loadUserProfile();
}, []);


  const pageProps = {
    currentView, 
    setCurrentView, 
    user, 
    setUser, 
    isPremium, 
    setIsPremium, 
    credits, 
    setCredits, 
    handleLogout, 
    selectedPlan, 
    setSelectedPlan
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-gray-800 flex flex-col relative overflow-hidden">
      
      {/* Control de Vistas (Router Simulado) */}
      {currentView === 'home' && <Home {...pageProps} />}
      {currentView === 'login' && <Login {...pageProps} />}
      {currentView === 'register' && <Register {...pageProps} />}
      {currentView === 'costs' && <Costos {...pageProps} />}
      {currentView === 'checkout' && <Checkout {...pageProps} />}
      {currentView === 'contact' && <Contacto {...pageProps} />}
      {currentView === 'historial' && <Historial {...pageProps} />}
      
      {/* El Chatbot flota sobre todas las páginas */}
      <Chatbot />
      
    </div>



  );
}