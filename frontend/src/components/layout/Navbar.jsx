import React from 'react';
import { Sparkles, Crown, User, LogOut } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, user, isPremium, credits, handleLogout }) {
  return (
    <nav className="relative z-10 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-white/20 p-1">
          <img
            src="RUTA_DE_TU_LOGO_AQUI.png"
            alt="Logo Carlsoft"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <Sparkles className="w-6 h-6 text-amber-300 hidden" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-wide">Carlsoft Solution</span>
          <p className="text-xs text-rose-200/80 font-light tracking-widest">PRODUCT IA</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-rose-100">
        <button onClick={() => setCurrentView('home')} className={`hover:text-white transition ${currentView === 'home' ? 'text-white border-b-2 border-amber-300' : ''}`}>INICIO</button>
        <button onClick={() => setCurrentView('costs')} className={`hover:text-white transition ${currentView === 'costs' ? 'text-white border-b-2 border-amber-300' : ''}`}>COSTOS</button>
        <button onClick={() => setCurrentView('contact')} className={`hover:text-white transition ${currentView === 'contact' ? 'text-white border-b-2 border-amber-300' : ''}`}>CONTACTO</button>
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <button onClick={() => setCurrentView('register')} className="text-rose-100 hover:text-white font-semibold text-sm transition hidden sm:block">
              REGISTRARSE
            </button>
            <button onClick={() => setCurrentView('login')} className="flex items-center gap-2 bg-[#fdfbf7] text-[#6b2122] px-5 py-2 rounded-full font-bold shadow-md hover:bg-white transition">
              <User className="w-4 h-4" /> INICIAR SESIÓN
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <div className="text-sm text-right">
              <p className="font-semibold text-white">{user.name}</p>
              {isPremium ? (
                <span className="text-amber-300 flex items-center justify-end gap-1 text-xs font-bold"><Crown className="w-3 h-3" /> Premium</span>
              ) : (
                <span className="text-rose-200 text-xs">Créditos: {credits}/3</span>
              )}
            </div>
            {!isPremium && (
              <button onClick={() => setCurrentView('costs')} className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#6b2122] px-3 py-1.5 rounded-full text-xs font-bold hover:from-amber-300 hover:to-amber-400 transition shadow-lg flex items-center gap-1 hover:-translate-y-0.5">
                <Crown className="w-4 h-4" /> UPGRADE
              </button>
            )}
            <button onClick={handleLogout} className="text-rose-200 hover:text-white transition ml-2 p-1 rounded hover:bg-white/10" title="Cerrar Sesión">
              <LogOut className="w-5 h-5" />
            </button>
            {user && (
              <button
                onClick={() => setCurrentView('historial')}
                className={`hover:text-white transition ${currentView === 'historial' ? 'text-white border-b-2 border-amber-300' : ''}`}
              >
                HISTORIAL
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}