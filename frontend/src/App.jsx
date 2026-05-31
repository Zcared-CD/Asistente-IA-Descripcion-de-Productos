import React, { useState } from 'react';
import Chatbot from './components/ui/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Costos from './pages/Costos';
import Checkout from './pages/Checkout';
import Contacto from './pages/Contacto';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(3);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setIsPremium(false);
    setCurrentView('home');
  };


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
      
      {/* El Chatbot flota sobre todas las páginas */}
      <Chatbot />
      
    </div>
  );
}