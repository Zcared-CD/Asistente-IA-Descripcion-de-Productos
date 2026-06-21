import React, { useState } from 'react';
import { Lock, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';
import api from '../api/axios';

export default function Checkout({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  handleLogout,
  selectedPlan
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión antes de comprar un plan.');
      setCurrentView('login');
      return;
    }

    try {
      setIsLoading(true);

      const planKey =
        selectedPlan.name.toLowerCase().includes('corporativo')
          ? 'CORPORATIVO'
          : 'PYMES';

      const response = await api.post('/stripe/create-checkout-session/', {
        plan: planKey
      });

      window.location.href = response.data.checkout_url;

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
        setCurrentView('login');
      } else {
        alert(error.response?.data?.error || 'No se pudo iniciar el pago.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlan) {
    setCurrentView('costs');
    return null;
  }

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
          <h1 className="text-4xl font-extrabold mb-4">Completar Compra</h1>
          <p className="text-rose-100 font-light text-lg">
            Tu pago se realizará de forma segura mediante Stripe Checkout.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-20 flex-1 w-full animate-fade-in">
        <button
          onClick={() => setCurrentView('costs')}
          className="flex items-center gap-2 text-[#6b2122] font-semibold mb-6 hover:underline"
        >
          &larr; Volver a Planes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-[#6b2122]">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Pago seguro con Stripe
                </h2>
                <p className="text-sm text-gray-500">
                  Serás redirigido a una página segura para completar tu suscripción.
                </p>
              </div>
            </div>

            <div className="bg-[#fdfbf7] border border-rose-100 rounded-2xl p-6 mb-6">
              <h3 className="font-extrabold text-[#6b2122] mb-4">
                Método de pago disponible
              </h3>

              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6b2122] text-white flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800">Stripe Checkout</p>
                    <p className="text-sm text-gray-500">
                      Tarjeta, Link y métodos disponibles desde Stripe.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full">
                  Activo
                </span>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4 mt-0.5" />
                <p>
                  Carlsoft no almacena números de tarjeta, CVC ni datos bancarios.
                  Stripe procesa el pago y notifica al sistema cuando la suscripción queda activa.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
              <h3 className="font-extrabold text-gray-800 mb-4">
                Incluye tu plan
              </h3>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Activación automática Premium después del pago.
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Administración de suscripción desde el portal de Stripe.
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Cancelación disponible en cualquier momento.
                </li>
              </ul>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#6b2122] hover:bg-[#52191a]'
                }`}
              >
                <Lock className="w-4 h-4" />
                {isLoading ? 'Redirigiendo a Stripe...' : 'Continuar a Stripe Checkout'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Transacción segura procesada por Stripe.
              </p>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#fdfbf7] rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Resumen del Pedido
              </h3>

              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                <div>
                  <p className="font-bold text-[#6b2122]">
                    Suscripción {selectedPlan.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cobro mensual recurrente
                  </p>
                </div>

                <span className="font-bold text-gray-800">
                  ${selectedPlan.price}.00
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>${selectedPlan.price}.00</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
                <span>Impuestos</span>
                <span>Calculados por Stripe</span>
              </div>

              <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>
                  ${selectedPlan.price}.00{' '}
                  <span className="text-sm font-normal text-gray-500">
                    MXN
                  </span>
                </span>
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 text-xs text-gray-500">
                Después de completar el pago, Stripe notificará a Carlsoft y tu cuenta se actualizará automáticamente a Premium.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}