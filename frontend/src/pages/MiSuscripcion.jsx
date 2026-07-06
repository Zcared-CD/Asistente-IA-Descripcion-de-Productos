import React, { useEffect, useState } from 'react';
import {
  Crown,
  Calendar,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Settings,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';
import api from '../api/axios';

export default function MiSuscripcion({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  handleLogout,
}) {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const cargarSuscripcion = async () => {
    try {
      const response = await api.get('/user-status/');
      setSubscriptionData(response.data);
    } catch (error) {
      console.error(error);
      alert('No se pudo cargar la información de la suscripción.');
    } finally {
      setIsLoading(false);
    }
  };

  const abrirPortalStripe = async () => {
    try {
      const response = await api.post('/stripe/customer-portal/');
      window.location.href = response.data.portal_url;
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'No se pudo abrir el portal.');
    }
  };

  useEffect(() => {
    cargarSuscripcion();
  }, []);

  const porcentajeDescripciones = subscriptionData
    ? Math.min((subscriptionData.descripciones_hoy / subscriptionData.limite_descripciones) * 100, 100)
    : 0;

  const porcentajeImagenes = subscriptionData
    ? Math.min((subscriptionData.imagenes_hoy / subscriptionData.limite_imagenes) * 100, 100)
    : 0;

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

        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Mi Suscripción</h1>
          <p className="text-rose-100 font-light text-lg">
            .
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="w-8 h-8 border-4 border-[#6b2122] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando suscripción...</p>
          </div>
        ) : (
          <>
            {subscriptionData?.cancel_at_period_end && (
              <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 shadow-sm flex gap-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-lg">Suscripción cancelada</h3>
                  <p className="text-sm">
                    Tu Premium seguirá activo hasta el <strong>{subscriptionData.fecha_fin_plan}</strong>.
                    Después volverás automáticamente al plan gratuito.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#6b2122]">
                    <Crown className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                      Plan {subscriptionData?.plan || 'FREE'}
                    </h2>
                    <p className="text-gray-500">
                      Estado: {subscriptionData?.is_premium ? 'Premium activo' : 'Plan gratuito'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-100">
                    <Calendar className="w-6 h-6 text-[#6b2122] mb-2" />
                    <p className="text-xs uppercase font-bold text-gray-400">Vencimiento</p>
                    <p className="font-extrabold text-gray-800">
                      {subscriptionData?.fecha_fin_plan || 'Sin fecha'}
                    </p>
                  </div>

                  <div className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-100">
                    <ShieldCheck className="w-6 h-6 text-[#6b2122] mb-2" />
                    <p className="text-xs uppercase font-bold text-gray-400">Días restantes</p>
                    <p className="font-extrabold text-gray-800">
                      {subscriptionData?.dias_restantes ?? 'N/A'}
                    </p>
                  </div>

                  <div className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-100">
                    <FileText className="w-6 h-6 text-[#6b2122] mb-2" />
                    <p className="text-xs uppercase font-bold text-gray-400">PDF</p>
                    <p className="font-extrabold text-gray-800">
                      {subscriptionData?.pdf_habilitado ? 'Habilitado' : 'Bloqueado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#6b2122]" />
                        Descripciones usadas hoy
                      </p>
                      <p className="font-bold text-[#6b2122]">
                        {subscriptionData?.descripciones_hoy} / {subscriptionData?.limite_descripciones}
                      </p>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#6b2122] h-full rounded-full"
                        style={{ width: `${porcentajeDescripciones}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#6b2122]" />
                        Imágenes usadas hoy
                      </p>
                      <p className="font-bold text-[#6b2122]">
                        {subscriptionData?.imagenes_hoy} / {subscriptionData?.limite_imagenes}
                      </p>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${porcentajeImagenes}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#fdfbf7] rounded-2xl shadow-lg border border-gray-200 p-6 h-fit">
                <h3 className="text-xl font-extrabold text-gray-900 mb-4">
                  Administración
                </h3>

                <p className="text-sm text-gray-600 mb-6">
                  Desde aquí puedes administrar tu suscripción, método de pago o cancelación.
                </p>

                {subscriptionData?.is_premium ? (
                  <button
                    onClick={abrirPortalStripe}
                    className="w-full py-3 rounded-xl font-bold bg-[#6b2122] text-white hover:bg-[#52191a] transition flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    Administrar Suscripción
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('costs')}
                    className="w-full py-3 rounded-xl font-bold bg-[#6b2122] text-white hover:bg-[#52191a] transition"
                  >
                    Mejorar Plan
                  </button>
                )}

                <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-500">
                  {subscriptionData?.aviso}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}