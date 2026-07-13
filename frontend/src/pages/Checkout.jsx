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
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      {/* HEADER */}
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

        <div className="relative z-10 pt-8 pb-14 sm:pt-10 sm:pb-16 lg:py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 sm:mb-4 leading-tight">
            Completar Compra
          </h1>

          <p className="text-rose-100 font-light text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Elige pagar con Stripe o con Openpay de forma segura.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10"
          style={{ transform: "translateY(1px)" }}
        >
          <svg
            className="relative block w-full h-10 sm:h-12 md:h-20"
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

      {/* CONTENIDO */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12 relative z-20 flex-1 w-full animate-fade-in min-w-0">
        <button
          type="button"
          onClick={() => setCurrentView("costs")}
          className="flex items-center gap-2 text-[#6b2122] font-semibold mb-5 sm:mb-6 hover:underline text-sm sm:text-base"
        >
          &larr; Volver a Planes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
          {/* FORMULARIO */}
          <section className="lg:col-span-8 min-w-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-start sm:items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-rose-50 flex items-center justify-center text-[#6b2122]">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Método de pago
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  Stripe es recomendado para suscripción automática. Openpay es
                  pago directo.
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-5 sm:space-y-6">
              {/* SELECTOR DE MÉTODO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`text-left rounded-2xl border p-4 sm:p-5 transition min-w-0 ${paymentMethod === "stripe"
                      ? "border-[#6b2122] bg-rose-50 shadow-md"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                >
                  <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2 mb-2">
                    <p className="font-extrabold text-gray-800">
                      Stripe Checkout
                    </p>

                    <span className="w-fit text-[10px] sm:text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-2.5 sm:px-3 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Suscripción automática, portal de cliente y cancelación.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("openpay")}
                  className={`text-left rounded-2xl border p-4 sm:p-5 transition min-w-0 ${paymentMethod === "openpay"
                      ? "border-[#6b2122] bg-rose-50 shadow-md"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                >
                  <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2 mb-2">
                    <p className="font-extrabold text-gray-800">
                      Openpay Tarjeta
                    </p>

                    <span className="w-fit text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 sm:px-3 py-1 rounded-full">
                      Alternativa
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Pago directo con tarjeta dentro de Carlsoft.
                  </p>
                </button>
              </div>

              {/* OPENPAY */}
              {paymentMethod === "openpay" && (
                <div className="bg-[#fdfbf7] border border-rose-100 rounded-2xl p-4 sm:p-6 space-y-5 min-w-0">
                  {/* PREVISUALIZACIÓN DE TARJETA */}
                  <div className="flex justify-center mb-4 sm:mb-6 overflow-hidden">
                    <div className="w-full max-w-[350px] overflow-x-auto flex justify-center">
                      <div className="origin-center scale-[0.82] min-[360px]:scale-90 sm:scale-100 shrink-0">
                        <Cards
                          number={cardData.card_number}
                          expiry={`${cardData.expiration_month}${cardData.expiration_year}`}
                          cvc={cardData.cvv2}
                          name={cardData.holder_name}
                          focused={
                            focused === "card_number"
                              ? "number"
                              : focused === "holder_name"
                                ? "name"
                                : focused === "cvv2"
                                  ? "cvc"
                                  : focused === "expiration_month" ||
                                    focused === "expiration_year"
                                    ? "expiry"
                                    : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-[#6b2122] text-base sm:text-lg">
                    Datos de tarjeta Openpay
                  </h3>

                  {/* TITULAR */}
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                    <input
                      name="holder_name"
                      value={cardData.holder_name}
                      onChange={handleChange}
                      onFocus={(e) => setFocused(e.target.name)}
                      placeholder="Nombre del titular"
                      autoComplete="cc-name"
                      className="w-full min-w-0 border border-gray-200 rounded-xl pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                      required
                    />
                  </div>

                  {/* NÚMERO DE TARJETA */}
                  <div className="relative">
                    <CreditCard className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                    <input
                      name="card_number"
                      value={cardData.card_number}
                      onChange={handleChange}
                      onFocus={(e) => setFocused(e.target.name)}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      className="w-full min-w-0 border border-gray-200 rounded-xl pl-11 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-sm sm:text-base outline-none tracking-wide sm:tracking-wider focus:ring-2 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                      required
                    />

                    <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-[#6b2122] bg-rose-50 px-2 sm:px-3 py-1 rounded-full">
                      {getCardType(cardData.card_number)}
                    </span>
                  </div>

                  {/* VENCIMIENTO Y CVV */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="relative min-w-0">
                      <CalendarDays className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />

                      <input
                        name="expiration_month"
                        value={cardData.expiration_month}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="MM"
                        inputMode="numeric"
                        autoComplete="cc-exp-month"
                        maxLength={2}
                        className="w-full min-w-0 border border-gray-200 rounded-xl pl-9 sm:pl-12 pr-2 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                        required
                      />
                    </div>

                    <div className="relative min-w-0">
                      <CalendarDays className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />

                      <input
                        name="expiration_year"
                        value={cardData.expiration_year}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="YY"
                        inputMode="numeric"
                        autoComplete="cc-exp-year"
                        maxLength={2}
                        className="w-full min-w-0 border border-gray-200 rounded-xl pl-9 sm:pl-12 pr-2 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                        required
                      />
                    </div>

                    <div className="relative min-w-0 col-span-2 sm:col-span-1">
                      <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />

                      <input
                        name="cvv2"
                        value={cardData.cvv2}
                        onChange={handleChange}
                        onFocus={(e) => setFocused(e.target.name)}
                        placeholder="CVV"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        type="password"
                        className="w-full min-w-0 border border-gray-200 rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />

                    <p>
                      Tu tarjeta se tokeniza con Openpay. Carlsoft no guarda datos
                      bancarios.
                    </p>
                  </div>
                </div>
              )}

              {/* STRIPE */}
              {paymentMethod === "stripe" && (
                <div className="bg-[#fdfbf7] border border-rose-100 rounded-2xl p-4 sm:p-6">
                  <h3 className="font-extrabold text-[#6b2122] mb-4 text-base sm:text-lg">
                    Pago con Stripe
                  </h3>

                  <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Suscripción mensual automática.</span>
                    </li>

                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Administración desde portal de Stripe.</span>
                    </li>

                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Cancelación disponible.</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* BOTÓN DE PAGO */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full min-h-12 py-3.5 sm:py-4 px-4 rounded-xl font-bold text-white text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2 text-center ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#6b2122] hover:bg-[#52191a] active:scale-[0.99]"
                  }`}
              >
                {paymentMethod === "stripe" ? (
                  <Lock className="w-4 h-4 shrink-0" />
                ) : (
                  <CreditCard className="w-4 h-4 shrink-0" />
                )}

                <span>
                  {isLoading
                    ? paymentMethod === "stripe"
                      ? "Redirigiendo a Stripe..."
                      : "Procesando pago..."
                    : paymentMethod === "stripe"
                      ? "Continuar a Stripe Checkout"
                      : "Pagar con Openpay"}
                </span>

                {!isLoading && (
                  <ArrowRight className="w-5 h-5 shrink-0 hidden min-[360px]:block" />
                )}
              </button>
            </form>
          </section>

          {/* RESUMEN */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="bg-[#fdfbf7] rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Resumen del Pedido
              </h3>

              <div className="flex flex-col min-[360px]:flex-row min-[360px]:justify-between min-[360px]:items-start gap-3 pb-4 border-b border-gray-200 mb-4">
                <div className="min-w-0">
                  <p className="font-bold text-[#6b2122] break-words">
                    Suscripción {selectedPlan.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {paymentMethod === "stripe"
                      ? "Cobro mensual recurrente"
                      : "Vigencia de 30 días"}
                  </p>
                </div>

                <span className="font-bold text-gray-800 whitespace-nowrap">
                  ${selectedPlan.price}.00
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700 mb-6">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Activación automática Premium.</span>
                </p>

                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Límites diarios según tu plan.</span>
                </p>
              </div>

              <div className="flex flex-col min-[360px]:flex-row min-[360px]:justify-between min-[360px]:items-center gap-2 text-lg sm:text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total</span>

                <span className="whitespace-nowrap">
                  ${selectedPlan.price}.00{" "}
                  <span className="text-xs sm:text-sm font-normal text-gray-500">
                    MXN
                  </span>
                </span>
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-xs text-gray-500 break-words">
                Método seleccionado:{" "}
                <strong className="text-gray-700">
                  {paymentMethod === "stripe"
                    ? "Stripe Checkout"
                    : "Openpay Tarjeta"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}