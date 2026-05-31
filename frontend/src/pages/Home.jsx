import React, { useState } from 'react';
import api from '../api/axios';
import { Camera, Sparkles, FileText, Image as ImageIcon, Download, Lock, Crown, Cpu, Type, Tag, Brain } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';

const customStyles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-150px * 5)); }
  }
  .animate-carousel {
    animation: scroll 20s linear infinite;
    display: flex;
    width: calc(150px * 10);
  }
  .carousel-item {
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export default function Home({ currentView, setCurrentView, user, isPremium, credits, setCredits, handleLogout }) {
  const [productName, setProductName] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(URL.createObjectURL(e.target.files[0]));
    }
  };

const handleGenerate = async (e) => {
  e.preventDefault();

  if (!user) {
    alert("Por favor inicia sesión primero.");
    setCurrentView('login');
    return;
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    alert("Tu sesión expiró.");
    setCurrentView('login');
    return;
  }

  setIsGenerating(true);

  try {

    const response = await api.post(
      '/generar-descripcion/',
      {
        nombre_producto: productName,
        palabras_clave: productDetails
      }
    );

    const data = response.data;

    setCredits(data.creditos);

    setResult({
      title: data.producto.titulo_generado,
      description: data.producto.descripcion_generada,
      tags: productDetails
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),

      imageUrl:
        imageFile ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    });

  } catch (error) {

    if (error.response?.status === 403) {
      alert("No tienes créditos disponibles.");
      setCurrentView('costs');
    }
    else if (error.response?.status === 401) {

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      alert("Tu sesión expiró.");

      setCurrentView('login');
    }
    else {
      console.error(error);
      alert("Error al generar la descripción.");
    }

  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="flex flex-col min-h-screen w-full">
      <style>{customStyles}</style>
      
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar currentView={currentView} setCurrentView={setCurrentView} user={user} isPremium={isPremium} credits={credits} handleLogout={handleLogout} />
        
        <div className="relative z-10 py-16 px-6 max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-black/20 text-rose-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10 shadow-sm">
            <Brain className="w-4 h-4 text-amber-300" />
            GENERADOR INTELIGENTE DE PRODUCTOS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Crea Descripciones Perfectas <br />con Inteligencia Artificial
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light mb-12">
            Sube tu producto, añade unas palabras clave y deja que nuestro motor de IA genere descripciones, etiquetas y presentaciones listas para tus campañas.
          </p>

          <div className="w-full bg-black/10 backdrop-blur-md py-6 rounded-2xl border border-white/5 overflow-hidden relative shadow-inner">
            <p className="text-xs text-rose-200/60 uppercase tracking-[0.2em] font-bold mb-4">Empresas que podrían usar esta tecnología</p>
            <div className="w-full overflow-hidden flex relative">
              <div className="animate-carousel">
                {[1, 2].map((group) => (
                  <React.Fragment key={group}>
                    <div className="carousel-item"><img src="RUTA_LOGO_NIKE.png" alt="Nike" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}}/><span className="hidden text-white/50 font-bold text-xl tracking-widest">NIKE</span></div>
                    <div className="carousel-item"><img src="RUTA_LOGO_ADIDAS.png" alt="Adidas" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}}/><span className="hidden text-white/50 font-bold text-xl tracking-widest">ADIDAS</span></div>
                    <div className="carousel-item"><img src="RUTA_LOGO_PUMA.png" alt="Puma" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}}/><span className="hidden text-white/50 font-bold text-xl tracking-widest">PUMA</span></div>
                    <div className="carousel-item"><img src="RUTA_LOGO_APPLE.png" alt="Apple" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}}/><span className="hidden text-white/50 font-bold text-xl tracking-widest">APPLE</span></div>
                    <div className="carousel-item"><img src="RUTA_LOGO_SAMSUNG.png" alt="Samsung" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}}/><span className="hidden text-white/50 font-bold text-xl tracking-widest">SAMSUNG</span></div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#6b2122] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#6b2122] to-transparent pointer-events-none"></div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20 flex-1 w-full animate-fade-in">
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-rose-50/50 rounded-2xl shadow-xl border border-rose-100 p-8 h-fit relative transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#6b2122] rounded-b-lg opacity-30"></div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#6b2122]">
            <Cpu className="w-8 h-8 p-1.5 bg-rose-50/80 rounded-lg text-[#6b2122] border border-rose-100 shadow-sm" />
            Configuración del Proyecto
          </h2>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">Nombre del Producto / Marca</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                </div>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ej. Zapatillas Running X" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 shadow-sm focus:-translate-y-1 focus:shadow-md" required />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">Características clave o palabras clave</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                </div>
                <textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)} placeholder="Ej. Alta velocidad, amortiguación ligera, diseño aerodinámico..." rows="4" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 resize-none shadow-sm focus:-translate-y-1 focus:shadow-md"></textarea>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">Imagen de Referencia</label>
              <div className="border-2 border-dashed border-[#6b2122]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-[#fdfbf7] hover:bg-rose-50 hover:border-[#6b2122]/50 transition-all duration-300 cursor-pointer relative group overflow-hidden hover:shadow-inner">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {imageFile ? (
                  <img src={imageFile} alt="Preview" className="h-32 object-contain rounded-lg shadow-md mb-3" />
                ) : (
                  <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-[#6b2122]/60" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-600">{imageFile ? 'Click para cambiar imagen' : 'Arrastra una imagen o haz click'}</span>
              </div>
            </div>
            <button type="submit" disabled={isGenerating} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition shadow-lg ${isGenerating ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#6b2122] hover:bg-[#52191a] hover:-translate-y-1'}`}>
              {isGenerating ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando con IA...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> {user ? 'Generar Descripción' : 'Inicia Sesión para Generar'}</>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white flex-1 rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative transform transition-all duration-500 hover:shadow-2xl">
            <div className="bg-gray-50 border-b border-gray-100 p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                <img src="RUTA_DE_TU_ICONO_AQUI.png" alt="Icono Resultado" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                <ImageIcon className="w-6 h-6 text-[#6b2122] hidden" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Resultado Generado</h2>
            </div>
            <div className="p-8 flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#fdfbf7]">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[#6b2122]/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-[#6b2122] border-r-[#6b2122]/50 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-transparent border-b-amber-400 border-l-amber-400/50 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <Cpu className="w-10 h-10 text-[#6b2122] animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Procesando con Inteligencia Artificial</h3>
                    <p className="text-[#6b2122] font-medium animate-pulse">Analizando variables y generando descripción óptima...</p>
                  </div>
                </div>
              ) : !result ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <div className="w-24 h-24 bg-[#fdfbf7] border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-[#6b2122]/20" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">El panel está vacío</h3>
                  <p className="max-w-sm">Completa el formulario a la izquierda y presiona el botón para que la IA haga su magia.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-white group">
                    <img src={result.imageUrl} alt="Producto Generado" className="w-full h-80 object-cover bg-gray-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {!isPremium && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[#6b2122] shadow-lg flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Marca de agua
                      </div>
                    )}
                    <h3 className="absolute bottom-6 left-6 right-6 text-3xl font-extrabold text-white drop-shadow-lg leading-tight">{result.title}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{result.description}</p>
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => (
                        <span key={i} className="bg-rose-50 text-[#6b2122] text-xs font-bold px-3 py-1.5 rounded-full border border-rose-100">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {result && (
              <div className="bg-white border-t border-gray-100 p-6">
                <button onClick={() => isPremium ? alert("Generando y descargando PDF...") : setCurrentView('costs')} className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition shadow-md ${isPremium ? 'bg-gray-900 hover:bg-black text-white hover:-translate-y-1' : 'bg-[#fdfbf7] text-[#6b2122] border border-[#6b2122]/20 hover:bg-rose-50'}`}>
                  {isPremium ? <Download className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                  Exportar Presentación como PDF
                </button>
                {!isPremium && <p className="text-center text-sm font-medium text-amber-600 mt-3 flex items-center justify-center gap-1"><Crown className="w-4 h-4"/> Requiere suscripción Premium para remover marcas de agua y descargar.</p>}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}