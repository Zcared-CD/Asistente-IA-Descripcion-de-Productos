import React from 'react';
import { Brain } from 'lucide-react';
import NetworkParticles from '../ui/NetworkParticles';
import Navbar from './Navbar';
import CurvedDivider from './CurvedDivider';

export default function Header({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  handleLogin,
  handleLogout,
}) {
  return (
    <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0">
      <NetworkParticles />

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isPremium={isPremium}
        credits={credits}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />

      {currentView === 'home' && (
        <div className="relative z-10 py-16 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-black/20 text-rose-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10 shadow-sm">
            <Brain className="w-4 h-4 text-amber-300" />
            GENERADOR INTELIGENTE DE PRODUCTOS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Crea Descripciones Perfectas <br />con Inteligencia Artificial
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light">
            Sube tu producto, añade unas palabras clave y deja que nuestro motor de IA genere descripciones, etiquetas y presentaciones listas para tus campañas.
          </p>
        </div>
      )}

      {(currentView === 'costs' || currentView === 'checkout') && (
        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Planes y Precios</h1>
          <p className="text-rose-100 font-light text-lg">
            Invierte en la mejor IA para tu negocio. Cancela en cualquier momento.
          </p>
        </div>
      )}

      {currentView === 'register' && (
        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Únete a Carlsoft IA</h1>
          <p className="text-rose-100 font-light text-lg">
            Crea tu cuenta gratis y obtén 3 créditos de generación de regalo.
          </p>
        </div>
      )}

      <CurvedDivider />
    </header>
  );
}