import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, FileText, Copy, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';
import api from '../api/axios';

export default function Historial({ currentView, setCurrentView, user, isPremium, credits, handleLogout }) {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setCurrentView('login');
        return;
      }

      try {
        const response = await api.get('/historial/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setHistorial(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setCurrentView('login');
        } else {
          alert('Error al cargar el historial.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    cargarHistorial();
  }, [setCurrentView]);

  const copiarTexto = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert('Descripción copiada al portapapeles.');
    } catch {
      alert('No se pudo copiar el texto.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          isPremium={isPremium}
          credits={credits}
          handleLogout={handleLogout}
        />

        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Historial de Descripciones</h1>
          <p className="text-rose-100 font-light text-lg">
            Consulta todas las descripciones generadas con tu cuenta.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full animate-fade-in">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="w-8 h-8 border-4 border-[#6b2122] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando historial...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-[#6b2122] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no tienes descripciones</h2>
            <p className="text-gray-500 mb-6">Genera tu primera descripción desde el inicio.</p>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-[#6b2122] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#52191a] transition"
            >
              Generar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {historial.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#6b2122] flex items-center gap-2">
                      <FileText className="w-6 h-6" />
                      {item.titulo_generado}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(item.fecha_creacion).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => copiarTexto(item.descripcion_generada)}
                    className="flex items-center justify-center gap-2 bg-rose-50 text-[#6b2122] px-4 py-2 rounded-xl font-bold border border-rose-100 hover:bg-rose-100 transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Producto
                  </p>
                  <p className="text-gray-800 font-semibold">{item.nombre_producto}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Palabras clave
                  </p>
                  <p className="text-gray-600">{item.palabras_clave}</p>
                </div>

                <div className="bg-[#fdfbf7] border border-gray-100 rounded-xl p-5">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {item.descripcion_generada}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}