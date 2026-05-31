import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import GoogleButton from '../components/forms/GoogleButton';
import NetworkParticles from '../components/ui/NetworkParticles';

export default function Login({ setUser, setCurrentView }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert("Por favor completa todos los campos.");
      return;
    }
    setUser({ name: 'Usuario Carlsoft', email: loginEmail });
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex flex-col bg-[#6b2122] overflow-y-auto">
      <NetworkParticles />
      
      <div className="pt-8 px-8 relative z-20 w-full mx-auto flex justify-start">
        <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-rose-100 hover:text-white transition font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/30">
          <ArrowLeft className="w-5 h-5" /> Regresar al Inicio
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 animate-[translateY_0.3s_ease-out]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6b2122]/10 rounded-full mb-4">
              <User className="w-8 h-8 text-[#6b2122]" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-500 mt-2">Inicia sesión para continuar</p>
          </div>
          
          <GoogleButton text="Continuar con Google" />

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs text-gray-400 relative z-10 font-semibold uppercase tracking-wider">O usa tu correo</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all focus:-translate-y-0.5 focus:shadow-md" placeholder="tu@empresa.com" />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700 group-focus-within:text-[#6b2122] transition-colors">Contraseña</label>
                <a href="#" className="text-xs font-semibold text-[#6b2122] hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                <input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-10 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all focus:-translate-y-0.5 focus:shadow-md" placeholder="••••••••" />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute top-3.5 right-3 text-gray-400 hover:text-[#6b2122] transition-colors">
                  {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-[#6b2122] hover:bg-[#52191a] transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2">
              Iniciar Sesión <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta? <button onClick={() => setCurrentView('register')} className="text-[#6b2122] font-bold hover:underline">Regístrate gratis</button>
          </p>
        </div>
      </div>
    </div>
  );
}