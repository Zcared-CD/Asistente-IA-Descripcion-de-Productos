import React from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import NetworkParticles from '../ui/NetworkParticles';

export default function Footer({ setCurrentView }) {
  return (
    <footer className="bg-[#3a1112] text-rose-200 py-10 relative overflow-hidden border-t border-[#2a0b0c] shrink-0 mt-auto">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <NetworkParticles />
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-lg font-bold text-white tracking-wide">Carlsoft Solution</span>
          </div>
          <p className="max-w-xs text-rose-200 leading-relaxed">Transparencia, documentación legal y canales de comunicación directa con nuestro equipo de ingeniería.</p>
        </div>
        <div className="md:text-center">
          <h4 className="text-white font-bold mb-4 tracking-wider">ENLACES RÁPIDOS</h4>
          <ul className="space-y-3">
            <li><button onClick={() => setCurrentView('home')} className="text-rose-200 hover:text-amber-300 transition flex items-center md:justify-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90"/> Inicio de Plataforma</button></li>
            <li><button onClick={() => setCurrentView('costs')} className="text-rose-200 hover:text-amber-300 transition flex items-center md:justify-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90"/> Planes y Suscripciones</button></li>
            <li><button onClick={() => setCurrentView('contact')} className="text-rose-200 hover:text-amber-300 transition flex items-center md:justify-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90"/> Soporte Técnico</button></li>
          </ul>
        </div>
        <div className="md:text-right">
          <h4 className="text-white font-bold mb-4 tracking-wider">CONTACTO</h4>
          <p className="text-rose-200">Soporte Técnico: Lunes a Viernes, 9am - 6pm</p>
          <p className="text-amber-300 font-bold mt-1 text-xl">+52 (744) 123 4567</p>
          <p className="mt-1 text-rose-200">Acapulco, Guerrero, MX.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-rose-900/50 text-center text-xs text-rose-300/60 relative z-10">
        &copy; {new Date().getFullYear()} Carlsoft Solution. Todos los derechos reservados.
      </div>
    </footer>
  );
}