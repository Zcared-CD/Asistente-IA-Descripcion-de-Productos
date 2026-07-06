import React, { useState, useEffect } from 'react';
import {
  Lock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  User,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import NetworkParticles from '../components/ui/NetworkParticles';
import api from '../api/axios';

export default function Checkout({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  handleLogout,
  selectedPlan,
  setIsPremium,
  setUserPlan,
  setFechaFinPlan,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const [cardData, setCardData] = useState({
    holder_name: '',
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    cvv2: '',
  });

  useEffect(() => {
    if (!selectedPlan) {
      setCurrentView('costs');
    }
  }, [selectedPlan, setCurrentView]);

  useEffect(() => {
    if (window.OpenPay) {
      window.OpenPay.setId(import.meta.env.VITE_OPENPAY_MERCHANT_ID);
      window.OpenPay.setApiKey(import.meta.env.VITE_OPENPAY_PUBLIC_KEY);
      window.OpenPay.setSandboxMode(import.meta.env.VITE_OPENPAY_SANDBOX === 'true');
    }
  }, []);

  if (!selectedPlan) return null;

  const getPlanKey = () =>
    selectedPlan.name.toLowerCase().includes('corporativo')
      ? 'CORPORATIVO'
      : 'PYMES';

  const handleStripePayment = async () => {
    const response = await api.post('/stripe/create-checkout-session/', {
      plan: getPlanKey(),
    });

    window.location.href = response.data.checkout_url;
  };

  const handleOpenpayPayment = async () => {
    if (!window.OpenPay || !window.OpenPay.deviceData) {
      alert('Openpay no cargó correctamente. Revisa los scripts en index.html.');
      return;
    }

    const deviceSessionId = window.OpenPay.deviceData.setup();

    const cleanCardData = {
      ...cardData,
      card_number: cardData.card_number.replace(/\s/g, ''),
    };

    window.OpenPay.token.create(
      cleanCardData,
      async (response) => {
        try {
          const tokenId = response.data.id;

          const backendResponse = await api.post('/openpay/create-charge/', {
            plan: getPlanKey(),
            token_id: tokenId,
            device_session_id: deviceSessionId,
          });

          alert('Pago aprobado. Tu plan Premium fue activado.');

          if (setIsPremium) setIsPremium(true);
          if (setUserPlan) setUserPlan(backendResponse.data.plan);
          if (setFechaFinPlan) setFechaFinPlan(backendResponse.data.fecha_fin_plan);

          setCurrentView('home');
        } catch (error) {
          console.error(error);
          alert(error.response?.data?.error || 'No se pudo completar el pago.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
        alert(error.data?.description || 'Datos de tarjeta inválidos.');
      }
    );
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión antes de comprar un plan.');
      setCurrentView('login');
      return;
    }

    try {
      setIsLoading(true);

      if (paymentMethod === 'stripe') {
        await handleStripePayment();
      } else {
        await handleOpenpayPayment();
      }
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
        setCurrentView('login');
      } else {
        alert(error.response?.data?.error || 'No se pudo iniciar el pago.');
      }

      setIsLoading(false);
    }
  };

  const getCardType = (number) => {
    const clean = number.replace(/\D/g, '');

    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';

    return 'Tarjeta';
  };

  const formatCardNumber = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'card_number') {
      newValue = formatCardNumber(value);
    }

    if (name === 'expiration_month') {
      newValue = value.replace(/\D/g, '').slice(0, 2);

      if (Number(newValue) > 12) {
        newValue = '12';
      }
    }

    if (name === 'expiration_year') {
      newValue = value.replace(/\D/g, '').slice(0, 2);
    }

    if (name === 'cvv2') {
      newValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
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
          <h1 className="text-4xl font-extrabold mb-4">Completar Compra</h1>
          <p className="text-rose-100 font-light text-lg">
            Elige pagar con Stripe o con Openpay de forma segura.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10"
          style={{ transform: 'translateY(1px)' }}
        >
          <svg
            className="relative block w-full h-12 md:h-20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z"
              fill="#fdfbf7"
            />
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
                  Método de pago
                </h2>
                <p className="text-sm text-gray-500">
                  Stripe es recomendado para suscripción automática. Openpay es pago directo.
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`text-left rounded-2xl border p-5 transition ${paymentMethod === 'stripe'
                    ? 'border-[#6b2122] bg-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-gray-800">Stripe Checkout</p>
                    <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Suscripción automática, portal de cliente y cancelación.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('openpay')}
                  className={`text-left rounded-2xl border p-5 transition ${paymentMethod === 'openpay'
                    ? 'border-[#6b2122] bg-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-gray-800">Openpay Tarjeta</p>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                      Alternativa
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Pago directo con tarjeta dentro de Carlsoft.
                  </p>
                </button>
              </div>

              {paymentMethod === 'openpay' && (
                <div className="bg-[#fdfbf7] border border-rose-100 rounded-2xl p-6 space-y-5">
                  <div className="flex justify-center mb-6">
                    <Cards
                      number={cardData.card_number}
                      expiry={`${cardData.expiration_month}${cardData.expiration_year}`}
                      cvc={cardData.cvv2}
                      name={cardData.holder_name}
                      focused={
                        focused === 'card_number'
                          ? 'number'
                          : focused === 'holder_name'
                            ? 'name'
                            : focused === 'cvv2'
                              ? 'cvc'
                              : focused === 'expiration_month' || focused === 'expiration_year'
                                ? 'expiry'
                                : ''
                      }
                    />
                  </div>

                  <h3 className="font-extrabold text-[#6b2122]">
                    Datos de tarjeta Openpay
                  </h3>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="holder_name"
                      value={cardData.holder_name}
                      onChange={handleChange}
                      placeholder="Nombre del titular"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#6b2122]/30"
                      required
                    />
                  </div>

                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="card_number"
                      value={cardData.card_number}
                      onChange={handleChange}
                      onFocus={(e) => setFocused(e.target.name)}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      maxLength={19}
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-24 py-4 outline-none tracking-wider focus:ring-2 focus:ring-[#6b2122]/30"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b2122] bg-rose-50 px-3 py-1 rounded-full">
                      {getCardType(cardData.card_number)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="expiration_month"
                        value={cardData.expiration_month}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="MM"
                        inputMode="numeric"
                        maxLength={2}
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#6b2122]/30"
                        required
                      />
                    </div>

                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="expiration_year"
                        value={cardData.expiration_year}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="YY"
                        inputMode="numeric"
                        maxLength={2}
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#6b2122]/30"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="cvv2"
                        value={cardData.cvv2}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="CVV"
                        inputMode="numeric"
                        maxLength={4}
                        type="password"
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#6b2122]/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4 mt-0.5" />
                    <p>
                      Tu tarjeta se tokeniza con Openpay. Carlsoft no guarda datos bancarios.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <div className="bg-[#fdfbf7] border border-rose-100 rounded-2xl p-6">
                  <h3 className="font-extrabold text-[#6b2122] mb-4">
                    Pago con Stripe
                  </h3>

                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Suscripción mensual automática.
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Administración desde portal de Stripe.
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Cancelación disponible.
                    </li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#6b2122] hover:bg-[#52191a]'
                  }`}
              >
                {paymentMethod === 'stripe' ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}

                {isLoading
                  ? paymentMethod === 'stripe'
                    ? 'Redirigiendo a Stripe...'
                    : 'Procesando pago...'
                  : paymentMethod === 'stripe'
                    ? 'Continuar a Stripe Checkout'
                    : 'Pagar con Openpay'}

                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
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
                    {paymentMethod === 'stripe'
                      ? 'Cobro mensual recurrente'
                      : 'Vigencia de 30 días'}
                  </p>
                </div>

                <span className="font-bold text-gray-800">
                  ${selectedPlan.price}.00
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-700 mb-6">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Activación automática Premium.
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Límites diarios según tu plan.
                </p>
              </div>

              <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>
                  ${selectedPlan.price}.00{' '}
                  <span className="text-sm font-normal text-gray-500">MXN</span>
                </span>
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 text-xs text-gray-500">
                Método seleccionado:{' '}
                <strong>
                  {paymentMethod === 'stripe' ? 'Stripe Checkout' : 'Openpay Tarjeta'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}