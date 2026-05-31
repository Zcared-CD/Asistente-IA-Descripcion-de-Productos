import React from 'react';
import { MessageCircle, Send, Bot } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';

export default function Contact({ currentView, setCurrentView, user, isPremium, credits, handleLogout }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} isPremium={isPremium} credits={credits} handleLogout={handleLogout} />
        
        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Soporte y Contacto</h1>
          <p className="text-rose-100 font-light text-lg">¿Tienes alguna duda o problema? Nuestro equipo está aquí para ayudarte.</p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-20 flex-1 w-full animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-[#6b2122]" /> Envíanos un mensaje
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado. Nuestro equipo de soporte te contactará pronto.'); setCurrentView('home'); }} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all" placeholder="Tu nombre" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                  <input type="text" required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all" placeholder="Tu apellido" />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all" placeholder="tu@correo.com" />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Orden / Compra <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input type="text" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all" placeholder="Ej. ORD-12345" />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Describe tu problema o consulta</label>
                <textarea required rows="4" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all resize-none" placeholder="¿En qué te podemos ayudar?"></textarea>
              </div>
              <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-[#6b2122] hover:bg-[#52191a] transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> Enviar Mensaje
              </button>
            </form>
          </div>
          <div className="w-full lg:w-1/2 bg-gray-100 relative min-h-[300px]">
            <img src="RUTA_IMAGEN_CONTACTO.png" alt="Soporte Técnico" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden absolute inset-0 w-full h-full bg-rose-50 flex-col items-center justify-center text-center p-8 border-l border-gray-200">
               <Bot className="w-20 h-20 text-[#6b2122]/30 mb-4" />
               <h3 className="text-xl font-bold text-[#6b2122]">Soporte Carlsoft</h3>
               <p className="text-sm text-gray-500 mt-2">Agrega aquí tu imagen reemplazando "RUTA_IMAGEN_CONTACTO.png"</p>
            </div>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}