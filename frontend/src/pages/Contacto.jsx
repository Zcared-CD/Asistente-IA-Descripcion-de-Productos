import React, { useState } from 'react';
import api from '../api/axios';
import { MessageCircle, Send, Bot } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';
import soporteImg from "../assets/soporte.png";


export default function Contact({ currentView, setCurrentView, user, isPremium, credits, handleLogout }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    numero_orden: '',
    mensaje: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await api.post('/contacto/', formData);

      setIsSent(true);

      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        numero_orden: '',
        mensaje: ''
      });



    } catch (error) {
      console.error(error);

      if (error.response?.status === 429) {
        alert('Has enviado demasiados mensajes. Intenta más tarde.');
      } else if (error.response?.data) {
        alert('Error: ' + JSON.stringify(error.response.data));
      } else {
        alert('No se pudo enviar el mensaje.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} isPremium={isPremium} credits={credits} handleLogout={handleLogout} />

        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Soporte y Contacto</h1>
          <p className="text-rose-100 font-light text-lg">udart</p>
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
            {isSent ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Send className="w-10 h-10 text-green-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-gray-800 mb-3">
                  ¡Mensaje enviado!
                </h3>

                <p className="text-gray-500 mb-8">
                  Nuestro equipo de soporte te contactará pronto.
                </p>

                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-[#6b2122] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#52191a] transition"
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Orden / Compra <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input
                  type="text"
                  name="numero_orden"
                  value={formData.numero_orden}
                  onChange={handleChange}
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                  placeholder="Ej. ORD-12345"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Describe tu problema o consulta</label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all resize-none"
                  placeholder="¿En qué te podemos ayudar?"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#6b2122] hover:bg-[#52191a]'
                  }`}
              >
                {isLoading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          )}
          </div>
          <div className="w-full lg:w-1/2 bg-gray-100 relative min-h-[300px]">
            <img  src={soporteImg} alt="Soporte Técnico" className="absolute inset-0 w-full h-full object-cover object-center" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden absolute inset-0 w-full h-full bg-rose-50 flex-col items-center justify-center text-center p-8 border-l border-gray-200"  onError={(e) => e.target.style.display = "none"}>
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