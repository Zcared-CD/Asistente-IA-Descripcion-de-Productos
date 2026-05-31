import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Sparkles, FileText, Image as ImageIcon, Download, Lock, Crown, User, LogOut, 
  ChevronDown, Cpu, Bot, X, MessageCircle, Type, Tag, Brain, Send, 
  CheckCircle2, CreditCard, Building, Mail, ArrowRight
} from 'lucide-react';

// --- COMPONENTE DE PARTÍCULAS TECNOLÓGICAS ---
const NetworkParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(253, 251, 247, 0.6)'; 
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(253, 251, 247, ${0.2 - dist / 600})`; 
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60" />
  );
};

// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function App() {
  // Navegación
  const [currentView, setCurrentView] = useState('home'); // 'home', 'costs', 'register', 'checkout'
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Usuario y Estado Global
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(3);
  
  // Generador IA
  const [productName, setProductName] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  
  // Estados para el Chatbot
  const [showBotMessage, setShowBotMessage] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: '¡Hola! Soy tu asistente de IA. ¿En qué te puedo ayudar hoy con tu proyecto en Carlsoft?' }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Estados Formulario Registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Estados Formulario Checkout
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paypal', 'transfer'

  const handleLogin = () => {
    setUser({ name: 'Usuario Demo', email: 'demo@carlsoft.com' });
    setCurrentView('home');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setUser({ name: regName || 'Nuevo Usuario', email: regEmail });
    alert("¡Registro exitoso! Bienvenido a Carlsoft Product IA.");
    setCurrentView('home');
  };

  const handleLogout = () => { 
    setUser(null); 
    setResult(null); 
    setIsPremium(false);
    setCurrentView('home');
  };

  const handleSelectPlan = (planName, price) => {
    setSelectedPlan({ name: planName, price: price });
    setCurrentView('checkout');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Simular procesamiento de pago
    alert(`¡Pago procesado con éxito vía ${paymentMethod.toUpperCase()}! Ahora eres un usuario Premium de Carlsoft.`);
    setIsPremium(true);
    setCurrentView('home');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Por favor inicia sesión o regístrate primero.");
      setCurrentView('register');
      return;
    }
    if (!isPremium && credits <= 0) {
      alert("No tienes créditos. ¡Actualiza a un plan Premium!");
      setCurrentView('costs');
      return;
    }

    setIsGenerating(true);
    if (!isPremium) setCredits(prev => prev - 1);

    setTimeout(() => {
      setResult({
        title: `Campaña Destacada: ${productName || 'Producto Innovador'}`,
        description: `Presentamos ${productName || 'nuestra última innovación'}, la solución diseñada específicamente para optimizar tu día a día. Con características avanzadas enfocadas en ${productDetails || 'tecnología de alto rendimiento'}, este producto refleja la excelencia de nuestra ingeniería.\n\nDescubre el poder de la transparencia y la calidad premium con Carlsoft Solution.`,
        tags: ['Innovación', 'Premium', 'Carlsoft Tech'],
        imageUrl: imageFile || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTB8MHwxfHNlYXJjaHwxfHxwcm9kdWN0fGVufDB8fHx8MTcxMTk5MzYwMA&ixlib=rb-4.0.3&q=80&w=400'
      });
      setIsGenerating(false);
    }, 2500);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatMessage('');
    setIsBotTyping(true);

    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Estoy analizando tu solicitud. Pronto un experto de Carlsoft o mi sistema automatizado te dará la mejor solución.' }]);
      setIsBotTyping(false);
    }, 1800);
  };

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isBotTyping, isChatOpen]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-gray-800 flex flex-col">
      
      {/* HEADER SECTION (Color Vino + Partículas) */}
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0">
        <NetworkParticles />
        
        {/* Navbar */}
        <nav className="relative z-10 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-white/20 p-1">
              <img 
                src="RUTA_DE_TU_LOGO_AQUI.png" 
                alt="Logo Carlsoft" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Sparkles className="w-6 h-6 text-amber-300 hidden" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide">Carlsoft Solution</span>
              <p className="text-xs text-rose-200/80 font-light tracking-widest">PRODUCT IA</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-rose-100">
            <button onClick={() => setCurrentView('home')} className={`hover:text-white transition ${currentView === 'home' ? 'text-white border-b-2 border-amber-300' : ''}`}>INICIO</button>
            <button onClick={() => setCurrentView('costs')} className={`hover:text-white transition ${currentView === 'costs' ? 'text-white border-b-2 border-amber-300' : ''}`}>COSTOS</button>
            <button className="hover:text-white transition">CONTACTO</button>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button onClick={() => setCurrentView('register')} className={`text-rose-100 hover:text-white font-semibold text-sm transition hidden sm:block ${currentView === 'register' ? 'text-white border-b-2 border-amber-300' : ''}`}>
                  REGISTRARSE
                </button>
                <button onClick={handleLogin} className="flex items-center gap-2 bg-[#fdfbf7] text-[#6b2122] px-5 py-2 rounded-full font-bold shadow-md hover:bg-white transition">
                  <User className="w-4 h-4" /> INICIAR SESIÓN
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <div className="text-sm text-right">
                  <p className="font-semibold text-white">{user.name}</p>
                  {isPremium ? (
                    <span className="text-amber-300 flex items-center justify-end gap-1 text-xs font-bold"><Crown className="w-3 h-3" /> Premium</span>
                  ) : (
                    <span className="text-rose-200 text-xs">Créditos: {credits}/3</span>
                  )}
                </div>
                {!isPremium && (
                  <button onClick={() => setCurrentView('costs')} className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#6b2122] px-3 py-1.5 rounded-full text-xs font-bold hover:from-amber-300 hover:to-amber-400 transition shadow-lg flex items-center gap-1">
                    <Crown className="w-4 h-4" /> UPGRADE
                  </button>
                )}
                <button onClick={handleLogout} className="text-rose-200 hover:text-white transition ml-2" title="Cerrar Sesión">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Area Dinámico según la vista */}
        {currentView === 'home' && (
          <div className="relative z-10 py-16 px-6 max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-black/20 text-rose-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10 shadow-sm">
              <Brain className="w-4 h-4 text-amber-300" />
              GENERADOR INTELIGENTE DE PRODUCTOS
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Crea Descripciones Perfectas <br />con Inteligencia Artificial
            </h1>
            <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light">
              Sube tu producto, añade unas palabras clave y deja que nuestro motor de IA genere descripciones, etiquetas y presentaciones listas para tus campañas.
            </p>
          </div>
        )}

        {(currentView === 'costs' || currentView === 'checkout') && (
          <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl font-extrabold mb-4">Planes y Precios</h1>
            <p className="text-rose-100 font-light text-lg">Invierte en la mejor IA para tu negocio. Cancela en cualquier momento.</p>
          </div>
        )}

        {currentView === 'register' && (
          <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl font-extrabold mb-4">Únete a Carlsoft IA</h1>
            <p className="text-rose-100 font-light text-lg">Crea tu cuenta gratis y obtén 3 créditos de generación de regalo.</p>
          </div>
        )}
        
        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <div className="flex-1">
        
        {/* --- VISTA: INICIO (GENERADOR) --- */}
        {currentView === 'home' && (
          <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20 animate-fade-in">
            {/* Formulario Generador (Columna Izquierda) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-white to-rose-50/50 rounded-2xl shadow-xl border border-rose-100 p-8 h-fit relative transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#6b2122] rounded-b-lg opacity-30"></div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#6b2122]">
                <Cpu className="w-8 h-8 p-1.5 bg-rose-50/80 rounded-lg text-[#6b2122] border border-rose-100 shadow-sm" />
                Configuración del Proyecto
              </h2>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-[#6b2122] transition-colors">Nombre del Producto / Marca</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                    </div>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ej. Servidor Corporativo Carlsoft" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 shadow-sm focus:-translate-y-1 focus:shadow-md" required />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-[#6b2122] transition-colors">Características clave o palabras clave</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                      <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                    </div>
                    <textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)} placeholder="Ej. Alta seguridad, respaldo en la nube..." rows="4" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 resize-none shadow-sm focus:-translate-y-1 focus:shadow-md"></textarea>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-[#6b2122] transition-colors">Imagen de Referencia</label>
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
                <button type="submit" disabled={isGenerating} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition shadow-lg ${isGenerating ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#6b2122] hover:bg-[#52191a]'}`}>
                  {isGenerating ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando con IA...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> {user ? 'Generar Descripción' : 'Inicia Sesión para Generar'}</>
                  )}
                </button>
              </form>
            </div>

            {/* Resultado Generador (Columna Derecha) */}
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
                    <button onClick={() => isPremium ? alert("Generando y descargando PDF...") : setCurrentView('costs')} className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition shadow-md ${isPremium ? 'bg-gray-900 hover:bg-black text-white' : 'bg-[#fdfbf7] text-[#6b2122] border border-[#6b2122]/20 hover:bg-rose-50'}`}>
                      {isPremium ? <Download className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      Exportar Presentación como PDF
                    </button>
                    {!isPremium && <p className="text-center text-sm font-medium text-amber-600 mt-3 flex items-center justify-center gap-1"><Crown className="w-4 h-4"/> Requiere suscripción Premium para remover marcas de agua y descargar.</p>}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* --- VISTA: REGISTRO --- */}
        {currentView === 'register' && (
          <main className="max-w-md mx-auto px-6 py-16 relative z-20 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <User className="w-8 h-8 text-[#6b2122]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Crear una cuenta</h2>
                <p className="text-sm text-gray-500 mt-1">Ingresa tus datos para comenzar</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                    <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition" placeholder="Juan Pérez" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                    <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition" placeholder="juan@empresa.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                    <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 mt-4 rounded-xl font-bold text-white bg-[#6b2122] hover:bg-[#52191a] transition shadow-lg flex items-center justify-center gap-2">
                  Registrarse <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                ¿Ya tienes cuenta? <button onClick={handleLogin} className="text-[#6b2122] font-bold hover:underline">Inicia Sesión</button>
              </p>
            </div>
          </main>
        )}

        {/* --- VISTA: COSTOS (PLANES) --- */}
        {currentView === 'costs' && (
          <main className="max-w-6xl mx-auto px-6 py-16 relative z-20 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plan Básico */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col transform transition hover:-translate-y-2 hover:shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Básico</h3>
                <p className="text-gray-500 text-sm mb-6 h-10">Ideal para probar nuestra tecnología IA.</p>
                <div className="text-4xl font-extrabold text-[#6b2122] mb-6">Gratis</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500"/> 3 Descripciones por mes</li>
                  <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500"/> Imágenes con marca de agua</li>
                  <li className="flex items-center gap-3 text-sm text-gray-400 opacity-60"><X className="w-5 h-5"/> Exportación en PDF</li>
                </ul>
                <button onClick={() => { !user ? setCurrentView('register') : alert("Ya tienes este plan por defecto.") }} className="w-full py-3 rounded-xl font-bold text-[#6b2122] bg-rose-50 hover:bg-rose-100 transition border border-rose-200">
                  Plan Actual
                </button>
              </div>

              {/* Plan Premium */}
              <div className="bg-gradient-to-b from-[#6b2122] to-[#4a1516] rounded-2xl shadow-2xl border-2 border-amber-300 p-8 flex flex-col relative transform transition hover:-translate-y-2 hover:shadow-2xl scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-300 text-[#6b2122] text-xs font-black px-4 py-1 rounded-b-lg uppercase tracking-wider">
                  Más Popular
                </div>
                <h3 className="text-xl font-bold text-white mb-2 mt-2 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-300"/> Premium</h3>
                <p className="text-rose-200 text-sm mb-6 h-10">Para creadores y pequeños negocios.</p>
                <div className="text-4xl font-extrabold text-white mb-1">$15<span className="text-lg font-normal text-rose-200">/mes</span></div>
                <p className="text-amber-300 text-xs mb-6 font-semibold">Cancela cuando quieras</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300"/> Descripciones ilimitadas</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300"/> Imágenes sin marca de agua</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-5 h-5 text-amber-300"/> Exportación de PDF habilitada</li>
                </ul>
                <button onClick={() => handleSelectPlan('Premium', 15)} className="w-full py-3 rounded-xl font-bold text-[#6b2122] bg-amber-300 hover:bg-amber-400 transition shadow-lg">
                  Elegir Plan Premium
                </button>
              </div>

              {/* Plan Corporativo */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col transform transition hover:-translate-y-2 hover:shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Corporativo</h3>
                <p className="text-gray-500 text-sm mb-6 h-10">Para empresas con alto volumen de productos.</p>
                <div className="text-4xl font-extrabold text-[#6b2122] mb-1">$49<span className="text-lg font-normal text-gray-500">/mes</span></div>
                <p className="text-gray-400 text-xs mb-6 font-semibold">Facturación anual disponible</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500"/> Todo lo de Premium</li>
                  <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500"/> API de generación habilitada</li>
                  <li className="flex items-center gap-3 text-sm text-gray-700"><CheckCircle2 className="w-5 h-5 text-green-500"/> Soporte técnico prioritario 24/7</li>
                </ul>
                <button onClick={() => handleSelectPlan('Corporativo', 49)} className="w-full py-3 rounded-xl font-bold text-[#6b2122] bg-rose-50 hover:bg-rose-100 transition border border-rose-200">
                  Elegir Plan Corporativo
                </button>
              </div>
            </div>
          </main>
        )}

        {/* --- VISTA: CHECKOUT (COMPRA) --- */}
        {currentView === 'checkout' && selectedPlan && (
          <main className="max-w-5xl mx-auto px-6 py-12 relative z-20 animate-fade-in">
            <button onClick={() => setCurrentView('costs')} className="flex items-center gap-2 text-[#6b2122] font-semibold mb-6 hover:underline">
              &larr; Volver a Planes
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Formulario de Pago */}
              <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles de Facturación</h2>
                
                {/* Selector de Método de Pago */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button onClick={() => setPaymentMethod('card')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'card' ? 'border-[#6b2122] bg-rose-50 text-[#6b2122]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <CreditCard className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">Tarjeta de Crédito</span>
                  </button>
                  <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'paypal' ? 'border-[#003087] bg-blue-50 text-[#003087]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <svg className="w-8 h-8 mb-2 fill-current" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>
                    <span className="font-semibold text-sm">PayPal</span>
                  </button>
                  <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${paymentMethod === 'transfer' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <Building className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">Transferencia</span>
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  {/* Campos Dinámicos según Método de Pago */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre en la tarjeta</label>
                        <input type="text" required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" placeholder="Titular de la cuenta" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Tarjeta</label>
                        <div className="relative">
                          <CreditCard className="absolute top-3.5 left-3 w-5 h-5 text-gray-400" />
                          <input type="text" required maxLength="19" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" placeholder="0000 0000 0000 0000" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Vencimiento</label>
                          <input type="text" required placeholder="MM/YY" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">CVC</label>
                          <input type="text" required placeholder="123" maxLength="4" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-8 animate-fade-in border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-gray-600 mb-4">Serás redirigido de forma segura a PayPal para completar tu compra.</p>
                      <button type="submit" className="bg-[#003087] text-white px-8 py-3 rounded-full font-bold hover:bg-[#001f5a] transition">
                        Pagar con PayPal
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in text-green-900">
                      <h4 className="font-bold mb-4 flex items-center gap-2"><Building className="w-5 h-5"/> Datos Bancarios de Carlsoft</h4>
                      <p className="text-sm mb-2"><strong>Banco:</strong> BBVA México</p>
                      <p className="text-sm mb-2"><strong>CLABE:</strong> 012345678901234567</p>
                      <p className="text-sm mb-4"><strong>Titular:</strong> Carlsoft Solution S.A. de C.V.</p>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <label className="block text-sm font-semibold mb-2">Sube tu comprobante de pago (PDF o JPG)</label>
                        <input type="file" required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition cursor-pointer" />
                      </div>
                    </div>
                  )}

                  {/* Botón de Submit Principal (Oculto en PayPal porque tiene su propio botón) */}
                  {paymentMethod !== 'paypal' && (
                    <button type="submit" className="w-full py-4 mt-8 rounded-xl font-bold text-white bg-[#6b2122] hover:bg-[#52191a] transition shadow-lg flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Pagar Seguro - ${selectedPlan.price}.00 USD
                    </button>
                  )}
                  <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3"/> Transacción encriptada de 256-bits
                  </p>
                </form>
              </div>

              {/* Resumen del Pedido */}
              <div className="lg:col-span-4">
                <div className="bg-[#fdfbf7] rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Pedido</h3>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <div>
                      <p className="font-bold text-[#6b2122]">Suscripción {selectedPlan.name}</p>
                      <p className="text-xs text-gray-500">Cobro mensual recurrente</p>
                    </div>
                    <span className="font-bold text-gray-800">${selectedPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>${selectedPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
                    <span>Impuestos (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>${selectedPlan.price}.00 <span className="text-sm font-normal text-gray-500">USD</span></span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* FOOTER CORPORATIVO */}
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
              <li><a href="#" className="text-rose-200 hover:text-amber-300 transition flex items-center md:justify-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90"/> Soporte Técnico</a></li>
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

      {/* CHATBOT INTERACTIVO Y BOTÓN FLOTANTE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {isChatOpen ? (
          <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col animate-fade-in origin-bottom-right mb-4">
            <div className="bg-[#6b2122] px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-[#6b2122] rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Asistente Carlsoft</h4>
                  <p className="text-[10px] text-green-300 font-medium">En línea</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-rose-200 hover:text-white transition-colors bg-white/10 p-1 rounded-md hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-72 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#6b2122] text-white self-end rounded-2xl rounded-br-sm' 
                    : 'bg-white text-gray-700 border border-gray-100 self-start rounded-2xl rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              ))}
              
              {isBotTyping && (
                <div className="bg-white text-gray-700 border border-gray-100 self-start rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-1.5 w-fit">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
              <input 
                type="text" 
                value={chatMessage} 
                onChange={e => setChatMessage(e.target.value)} 
                placeholder="Escribe tu mensaje..." 
                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-[#6b2122] focus:ring-1 focus:ring-[#6b2122] rounded-full px-4 py-2.5 text-sm outline-none transition-all" 
              />
              <button 
                type="submit" 
                disabled={!chatMessage.trim()}
                className="bg-[#6b2122] text-white p-2.5 rounded-full hover:bg-[#52191a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {showBotMessage && (
              <div className="bg-white text-gray-800 p-4 rounded-2xl shadow-2xl mb-4 border border-rose-100 w-64 origin-bottom-right relative transition-all animate-[bounce_2s_infinite]">
                <button 
                  onClick={() => setShowBotMessage(false)} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-rose-600 transition-colors bg-gray-50 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-sm font-medium pr-4 text-gray-700">
                  ¡Hola! Soy tu asistente de IA. Da clic aquí para platicar sobre tu proyecto en Carlsoft.
                </p>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-rose-100 transform rotate-45"></div>
              </div>
            )}
            
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-br from-[#6b2122] to-[#4a1516] text-amber-300 p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-[#6b2122]/50 transition-all duration-300 relative group border border-amber-300/20"
            >
              <span className="absolute inset-0 rounded-full bg-[#6b2122] animate-ping opacity-40"></span>
              <Bot className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform" />
            </button>
          </>
        )}
      </div>

    </div>
  );
}
