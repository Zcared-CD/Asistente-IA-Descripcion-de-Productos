import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Phone, Sparkles } from 'lucide-react';
import api from '../api/axios';
import GoogleButton from '../components/forms/GoogleButton';
import NetworkParticles from '../components/ui/NetworkParticles';
import  RegistroImg from "../assets/Registrarse.png";

// Añadimos setIsPremium y setCredits a las props
export default function Register({ setUser, setIsPremium, setCredits, setCurrentView }) {
  const [regName, setRegName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength; 
  };

  const pwdStrength = calculatePasswordStrength(regPassword);
  
  const getStrengthIndicator = () => {
    if (regPassword.length === 0) return { width: '0%', color: 'bg-gray-200', text: '' };
    if (pwdStrength <= 2) return { width: '33%', color: 'bg-red-500', text: 'Baja' };
    if (pwdStrength === 3 || pwdStrength === 4) return { width: '66%', color: 'bg-amber-500', text: 'Media' };
    return { width: '100%', color: 'bg-green-500', text: 'Alta' };
  };

  const strengthData = getStrengthIndicator();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regLastName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }
    if (pwdStrength <= 2) {
      alert("Por favor utiliza una contraseña más segura (mínimo 6 caracteres, incluyendo números o mayúsculas).");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Petición para REGISTRAR al usuario en Django
      await api.post('/register/', {
        email: regEmail,
        password: regPassword,
        first_name: regName,
        last_name: regLastName,
        telefono: regPhone
      });

      // 2. AUTO-LOGIN: Ya que se registró, pedimos sus tokens inmediatamente
      const loginResponse = await api.post('/login/', {
        username: regEmail,
        password: regPassword
      });

      const tokenData = loginResponse.data;
      localStorage.setItem('access_token', tokenData.access);
      localStorage.setItem('refresh_token', tokenData.refresh);

      // 3. Obtener el perfil para llenar los datos de React (créditos, premium, etc.)
      const profileResponse = await api.get('/profile/', {
        headers: {
          'Authorization': `Bearer ${tokenData.access}`
        }
      });

      const profileData = profileResponse.data;
      
      setUser({ 
        name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : profileData.username, 
        email: profileData.email 
      });
      setIsPremium(profileData.is_premium);
      setCredits(profileData.creditos);

      alert("¡Registro exitoso! Bienvenido a Carlsoft Product IA.");
      setCurrentView('home');

    } catch (error) {
      if (error.response && error.response.data) {
        // Django nos dice exactamente qué falló (ej. el correo ya existe)
        alert("Error al registrar: " + JSON.stringify(error.response.data));
      } else {
        alert("Error de conexión con el servidor. Verifica que Django esté encendido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex flex-col bg-[#6b2122] overflow-y-auto">
      <NetworkParticles />
      
      <div className="pt-8 px-8 relative z-20 w-full mx-auto flex justify-start">
        <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-rose-100 hover:text-white transition font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/30">
          <ArrowLeft className="w-5 h-5" /> Regresar al Inicio
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 animate-[translateY_0.3s_ease-out]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#6b2122]/10 rounded-full mb-4 overflow-hidden border border-rose-100">
              <img src={RegistroImg}alt="Icono Registro" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <Sparkles className="w-8 h-8 text-[#6b2122] hidden" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">Crea tu cuenta</h2>
            <p className="text-sm text-gray-500 mt-2">Únete y obtén 3 créditos de IA gratis</p>
          </div>

          <GoogleButton text="Registrarse con Google" />

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs text-gray-400 relative z-10 font-semibold uppercase tracking-wider">O regístrate con correo</span>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Nombre</label>
                <div className="relative">
                  <User className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                  <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md" placeholder="Juan" />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Apellidos</label>
                <div className="relative">
                  <User className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                  <input type="text" value={regLastName} onChange={e=>setRegLastName(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md" placeholder="Pérez" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                  <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md" placeholder="tu@empresa.com" />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                  <input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md" placeholder="+52 000 000 0000" />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Contraseña</label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md" placeholder="Crea una contraseña segura" />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute top-3 right-3 text-gray-400 hover:text-[#6b2122] transition-colors">
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regPassword.length > 0 && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-500">Seguridad:</span>
                    <span className={`text-xs font-bold ${strengthData.text === 'Baja' ? 'text-red-500' : strengthData.text === 'Media' ? 'text-amber-500' : 'text-green-500'}`}>{strengthData.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthData.color} transition-all duration-500`} style={{ width: strengthData.width }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-[#6b2122] transition-colors">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3 w-4 h-4 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                <input type={showRegConfirmPassword ? "text" : "password"} value={regConfirmPassword} onChange={e=>setRegConfirmPassword(e.target.value)} required className={`w-full bg-[#fdfbf7] border ${regConfirmPassword && regPassword !== regConfirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#6b2122]'} rounded-xl pl-9 pr-9 py-2.5 focus:ring-2 outline-none transition-all text-sm focus:-translate-y-0.5 focus:shadow-md`} placeholder="Repite tu contraseña" />
                <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute top-3 right-3 text-gray-400 hover:text-[#6b2122] transition-colors">
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-xs text-red-500 mt-1 font-medium animate-fade-in">Las contraseñas no coinciden.</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-[#4a1516] cursor-not-allowed opacity-80' : 'bg-[#6b2122] hover:bg-[#52191a] hover:shadow-lg hover:-translate-y-1'}`}
            >
              {isLoading ? (
                 <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creando cuenta...</>
              ) : (
                 <>Crear Cuenta <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta? <button onClick={() => setCurrentView('login')} className="text-[#6b2122] font-bold hover:underline">Inicia Sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
}