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
  const [userAviso, setUserAviso] = useState(null);
  const [userPlan, setUserPlan] = useState('FREE');
  const [fechaFinPlan, setFechaFinPlan] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    setUser(null);
    setIsPremium(false);
    setCredits(3);
    setUserAviso(null);
    setCurrentView('home');
    setUserPlan('FREE');
    setFechaFinPlan(null);
    setCancelAtPeriodEnd(false);
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) return;

      try {
        const response = await api.get('/profile/');

        const profileData = response.data;

        setUser({
          name: profileData.first_name
            ? `${profileData.first_name} ${profileData.last_name}`
            : profileData.username,
          email: profileData.email
        });

        setIsPremium(profileData.is_premium);
        setCredits(profileData.creditos);
        

        const statusResponse = await api.get('/user-status/');
        const statusData = statusResponse.data;

        setUserAviso(statusData.aviso);

        setIsPremium(statusData.is_premium);
        setUserPlan(statusData.plan);
        setFechaFinPlan(statusData.fecha_fin_plan);
        setCancelAtPeriodEnd(statusData.cancel_at_period_end);
        setCredits(statusData.creditos);

      } catch (error) {
        console.error("ERROR CARGANDO PERFIL:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          setIsPremium(false);
          setCredits(3);
          setUserPlan('FREE');
          setFechaFinPlan(null);
          setCancelAtPeriodEnd(false);
        }
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
    setSelectedPlan,
    userAviso,
    setUserAviso,
    userPlan,
    fechaFinPlan,
    cancelAtPeriodEnd,
    setUserPlan,
    setFechaFinPlan,
    setCancelAtPeriodEnd,
  };

  return (

    <div className="min-h-screen bg-[#fdfbf7] font-sans text-gray-800 flex flex-col relative overflow-hidden">

      {userAviso && user && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#6b2122] text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 animate-fade-in">
          <span className="font-semibold">
            {cancelAtPeriodEnd && fechaFinPlan
              ? `Suscripción cancelada. Premium activo hasta ${fechaFinPlan}.`
              : userAviso}
          </span>
          <button
            onClick={() => setUserAviso(null)}
            className="ml-4 text-rose-200 hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

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