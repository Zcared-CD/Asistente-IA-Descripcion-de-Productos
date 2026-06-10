import React from 'react';
import api from '../api/axios';
import { CheckCircle2, X, Crown, Settings } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';

export default function Costs({ currentView, setCurrentView, user, isPremium, credits, handleLogout, setSelectedPlan, cancelAtPeriodEnd, fechaFinPlan, }) {

  const handlePlanClick = (plan) => {
    if (!user) {
      setCurrentView('login');
      return;
    }

    setSelectedPlan(plan);
    setCurrentView('checkout');
  };

  const abrirPortalStripe = async () => {
    try {
      const response = await api.post(
        "/stripe/customer-portal/"
      );

      window.location.href = response.data.portal_url;

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
        "No se pudo abrir el portal."
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} isPremium={isPremium} credits={credits} handleLogout={handleLogout} />

        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Planes y Precios</h1>
          <p className="text-rose-100 font-light text-lg">Invierte en la mejor IA para tu negocio. Cancela en cualquier momento.</p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 relative z-20 flex-1 w-full animate-fade-in">
        {cancelAtPeriodEnd && fechaFinPlan && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-lg mb-1">
              Suscripción cancelada
            </h3>
            <p className="text-sm">
              Tu plan Premium seguirá activo hasta el{" "}
              <strong>{fechaFinPlan}</strong>. Después volverás automáticamente al plan gratuito.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col transform transition hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Básico</h3>
            <p className="text-gray-500 text-sm mb-6 h-10">Ideal para probar nuestra tecnología IA.</p>
            <div className="text-4xl font-extrabold text-[#6b2122] mb-6">Gratis</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500" /> 5 descripciones por día</li>
              <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500" /> 3 imágenes con marca de agua al día</li>
              <li className="flex items-center gap-3 text-sm text-gray-400 opacity-60"><X className="w-5 h-5" /> Exportación en PDF</li>
            </ul>
            <button
              onClick={() => (!user ? setCurrentView('register') : null)}
              disabled={user}
              className={`w-full py-3 rounded-xl font-bold transition border ${user
                ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                : "text-[#6b2122] bg-rose-50 hover:bg-rose-100 border-rose-200"
                }`}
            >
              {!user ? "Registrarse Gratis" : isPremium ? "Plan Básico" : "Plan Actual"}
            </button>
          </div>

          <div className="bg-gradient-to-b from-[#6b2122] to-[#4a1516] rounded-2xl shadow-2xl border-2 border-amber-300 p-8 flex flex-col relative transform transition hover:-translate-y-2 hover:shadow-2xl scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-300 text-[#6b2122] text-xs font-black px-4 py-1 rounded-b-lg uppercase tracking-wider">Más Popular</div>
            <h3 className="text-xl font-bold text-white mb-2 mt-2 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-300" /> PyMes</h3>
            <p className="text-rose-200 text-sm mb-6 h-10">Para creadores y pequeños negocios.</p>
            <div className="text-4xl font-extrabold text-white mb-1">$10<span className="text-lg font-normal text-rose-200">/mes</span></div>
            <p className="text-amber-300 text-xs mb-6 font-semibold">Cancela cuando quieras</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300" /> 20 descripciones al día</li>
              <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300" /> 10 imágenes sin marca de agua al día</li>
              <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300" /> Exportación de PDF habilitada</li>
            </ul>
            <button
              onClick={() =>
                isPremium
                  ? abrirPortalStripe()
                  : handlePlanClick({ name: 'PyMes', price: 10 })
              }
              className="w-full py-3 rounded-xl font-bold text-[#6b2122] bg-amber-300 hover:bg-amber-400 transition shadow-lg flex items-center justify-center gap-2"
            >
              {isPremium ? (
                <>
                  <Settings className="w-5 h-5" />
                  Administrar Suscripción
                </>
              ) : (
                "Elegir Plan PyMes"
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col transform transition hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Corporativo</h3>
            <p className="text-gray-500 text-sm mb-6 h-10">Para empresas con alto volumen de productos.</p>
            <div className="text-4xl font-extrabold text-[#6b2122] mb-1">$59<span className="text-lg font-normal text-gray-500">/mes</span></div>
            <p className="text-gray-400 text-xs mb-6 font-semibold">Facturación anual disponible</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500" /> Todo ilimitado</li>
              <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500" /> API de generación habilitada</li>
              <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500" /> Soporte técnico prioritario 24/7</li>
            </ul>
            <button
              onClick={() =>
                isPremium
                  ? alert("Después conectaremos mejora de plan con Stripe Billing Portal.")
                  : handlePlanClick({ name: 'Corporativo', price: 59 })
              }
              className="w-full py-3 rounded-xl font-bold text-[#6b2122] bg-rose-50 hover:bg-rose-100 transition border border-rose-200"
            >
              {isPremium ? "Mejorar Suscripción" : "Elegir Plan Corporativo"}
            </button>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}