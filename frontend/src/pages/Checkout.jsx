import React, { useState } from 'react';
import { CreditCard, Building, Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';

export default function Checkout({ currentView, setCurrentView, user, isPremium, setIsPremium, credits, handleLogout, selectedPlan }) {
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    alert(`¡Pago procesado con éxito vía ${paymentMethod.toUpperCase()}! Ahora eres un usuario Premium de Carlsoft.`);
    setIsPremium(true);
    setCurrentView('home');
  };

  if (!selectedPlan) {
    setCurrentView('costs');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} isPremium={isPremium} credits={credits} handleLogout={handleLogout} />
        
        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Completar Compra</h1>
          <p className="text-rose-100 font-light text-lg">Estás a un paso de potenciar tu negocio con IA.</p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-20 flex-1 w-full animate-fade-in">
        <button onClick={() => setCurrentView('costs')} className="flex items-center gap-2 text-[#6b2122] font-semibold mb-6 hover:underline">
          &larr; Volver a Planes
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles de Facturación</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={() => setPaymentMethod('card')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'card' ? 'border-[#6b2122] bg-rose-50 text-[#6b2122]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><CreditCard className="w-8 h-8 mb-2" /><span className="font-semibold text-sm">Tarjeta de Crédito</span></button>
              <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'paypal' ? 'border-[#003087] bg-blue-50 text-[#003087]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><svg className="w-8 h-8 mb-2 fill-current" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg><span className="font-semibold text-sm">PayPal</span></button>
              <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'transfer' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><Building className="w-8 h-8 mb-2" /><span className="font-semibold text-sm">Transferencia</span></button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              {paymentMethod === 'card' && (
                <div className="space-y-4 animate-fade-in">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nombre en la tarjeta</label><input type="text" required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" placeholder="Titular de la cuenta" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Número de Tarjeta</label><div className="relative"><CreditCard className="absolute top-3.5 left-3 w-5 h-5 text-gray-400" /><input type="text" required maxLength="19" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" placeholder="0000 0000 0000 0000" /></div></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Vencimiento</label><input type="text" required placeholder="MM/YY" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">CVC</label><input type="text" required placeholder="123" maxLength="4" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" /></div>
                  </div>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="text-center py-8 animate-fade-in border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-600 mb-4">Serás redirigido de forma segura a PayPal para completar tu compra.</p>
                  <button type="submit" className="bg-[#003087] text-white px-8 py-3 rounded-full font-bold hover:bg-[#001f5a] transition">Pagar con PayPal</button>
                </div>
              )}
              {paymentMethod === 'transfer' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in text-green-900">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Building className="w-5 h-5"/> Datos Bancarios de Carlsoft</h4>
                  <p className="text-sm mb-2"><strong>Banco:</strong> BBVA México</p>
                  <p className="text-sm mb-2"><strong>CLABE:</strong> 012345678901234567</p>
                  <p className="text-sm mb-4"><strong>Titular:</strong> Carlsoft Solution S.A. de C.V.</p>
                  <div className="mt-4 pt-4 border-t border-green-200"><label className="block text-sm font-semibold mb-2">Sube tu comprobante de pago (PDF o JPG)</label><input type="file" required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition cursor-pointer" /></div>
                </div>
              )}
              {paymentMethod !== 'paypal' && (
                <button type="submit" className="w-full py-4 mt-8 rounded-xl font-bold text-white bg-[#6b2122] hover:bg-[#52191a] transition shadow-lg flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Pagar Seguro - ${selectedPlan.price}.00 USD
                </button>
              )}
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1"><Lock className="w-3 h-3"/> Transacción encriptada de 256-bits</p>
            </form>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-[#fdfbf7] rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Pedido</h3>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4"><div><p className="font-bold text-[#6b2122]">Suscripción {selectedPlan.name}</p><p className="text-xs text-gray-500">Cobro mensual recurrente</p></div><span className="font-bold text-gray-800">${selectedPlan.price}.00</span></div>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2"><span>Subtotal</span><span>${selectedPlan.price}.00</span></div>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-6"><span>Impuestos (0%)</span><span>$0.00</span></div>
              <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200"><span>Total</span><span>${selectedPlan.price}.00 <span className="text-sm font-normal text-gray-500">USD</span></span></div>
            </div>
          </div>
        </div>
      </main>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}