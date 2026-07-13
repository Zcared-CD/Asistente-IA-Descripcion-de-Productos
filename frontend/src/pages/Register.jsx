import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Phone,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";
import GoogleButton from "../components/forms/GoogleButton";
import NetworkParticles from "../components/ui/NetworkParticles";
import RegistroImg from "../assets/Registrarse.png";

export default function Register({
  setUser,
  setIsPremium,
  setCredits,
  setCurrentView,
}) {
  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (regPassword.length === 0) {
      return {
        width: "0%",
        color: "bg-gray-200",
        text: "",
      };
    }

    if (pwdStrength <= 2) {
      return {
        width: "33%",
        color: "bg-red-500",
        text: "Baja",
      };
    }

    if (pwdStrength === 3 || pwdStrength === 4) {
      return {
        width: "66%",
        color: "bg-amber-500",
        text: "Media",
      };
    }

    return {
      width: "100%",
      color: "bg-green-500",
      text: "Alta",
    };
  };

  const strengthData = getStrengthIndicator();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const cleanName = regName.trim();
    const cleanLastName = regLastName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();

    if (
      !cleanName ||
      !cleanLastName ||
      !cleanEmail ||
      !cleanPhone ||
      !regPassword ||
      !regConfirmPassword
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      alert("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }

    if (pwdStrength <= 2) {
      alert(
        "Utiliza una contraseña más segura: mínimo 6 caracteres e incluye números, mayúsculas o símbolos."
      );
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/register/", {
        email: cleanEmail,
        password: regPassword,
        first_name: cleanName,
        last_name: cleanLastName,
        telefono: cleanPhone,
      });

      const loginResponse = await api.post("/login/", {
        username: cleanEmail,
        password: regPassword,
      });

      const tokenData = loginResponse.data;

      localStorage.setItem("access_token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh);

      const profileResponse = await api.get("/profile/", {
        headers: {
          Authorization: `Bearer ${tokenData.access}`,
        },
      });

      const profileData = profileResponse.data;

      const fullName = [profileData.first_name, profileData.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      setUser({
        name: fullName || profileData.username,
        email: profileData.email,
      });

      setIsPremium(Boolean(profileData.is_premium));
      setCredits(profileData.creditos ?? 0);

      alert("¡Registro exitoso! Bienvenido a Carlsoft Product IA.");
      setCurrentView("home");
    } catch (error) {
      console.error("Error al registrar:", error);

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          alert(`Error al registrar: ${data}`);
        } else if (data.email) {
          alert(`Correo: ${data.email}`);
        } else if (data.password) {
          alert(`Contraseña: ${data.password}`);
        } else if (data.error) {
          alert(data.error);
        } else {
          alert("No se pudo completar el registro. Revisa tus datos.");
        }
      } else {
        alert(
          "Error de conexión con el servidor. Verifica que Django esté encendido."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrengthTextClass =
    strengthData.text === "Baja"
      ? "text-red-500"
      : strengthData.text === "Media"
        ? "text-amber-500"
        : "text-green-500";

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[#6b2122]">
      <NetworkParticles />

      {/* Botón para volver */}
      <div className="relative z-20 w-full px-3 pt-3 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <button
          type="button"
          onClick={() => setCurrentView("home")}
          className="
            inline-flex
            items-center
            gap-2
            max-w-full
            text-rose-100
            hover:text-white
            transition
            font-medium
            text-sm
            sm:text-base
            bg-black/20
            px-3
            sm:px-4
            py-2
            rounded-full
            backdrop-blur-sm
            border
            border-white/10
            hover:bg-black/30
          "
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />

          <span className="truncate">Regresar al inicio</span>
        </button>
      </div>

      {/* Contenido */}
      <main className="relative z-10 flex min-h-[calc(100dvh-4rem)] items-center justify-center px-3 py-6 sm:px-6 sm:py-8">
        <div
          className="
            w-full
            max-w-lg
            bg-white/95
            backdrop-blur-md
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            border
            border-white/20
            p-5
            sm:p-7
            lg:p-8
            animate-fade-in
          "
        >
          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#6b2122]/10 rounded-full mb-4 overflow-hidden border border-rose-100">
              <img
                src={RegistroImg}
                alt="Icono de registro"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";

                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = "block";
                  }
                }}
              />

              <Sparkles className="hidden w-8 h-8 text-[#6b2122]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
              Crea tu cuenta
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Únete y obtén 3 créditos de IA gratis
            </p>
          </div>

          <GoogleButton text="Registrarse con Google" />

          <div className="relative flex items-center justify-center my-5 sm:my-6">
            <div className="border-t border-gray-200 w-full absolute" />

            <span className="bg-white px-3 sm:px-4 text-[10px] sm:text-xs text-gray-400 relative z-10 font-semibold uppercase tracking-wider text-center">
              O regístrate con correo
            </span>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Nombre y apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group min-w-0">
                <label
                  htmlFor="register-name"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
                >
                  Nombre
                </label>

                <div className="relative">
                  <User className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                  <input
                    id="register-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="given-name"
                    required
                    disabled={isLoading}
                    className="
                      w-full
                      min-w-0
                      bg-[#fdfbf7]
                      border
                      border-gray-200
                      rounded-xl
                      pl-9
                      pr-3
                      py-3
                      text-sm
                      sm:text-base
                      outline-none
                      transition-all
                      focus:ring-2
                      focus:ring-[#6b2122]/30
                      focus:border-[#6b2122]
                      focus:shadow-md
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div className="group min-w-0">
                <label
                  htmlFor="register-last-name"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
                >
                  Apellidos
                </label>

                <div className="relative">
                  <User className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                  <input
                    id="register-last-name"
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    autoComplete="family-name"
                    required
                    disabled={isLoading}
                    className="
                      w-full
                      min-w-0
                      bg-[#fdfbf7]
                      border
                      border-gray-200
                      rounded-xl
                      pl-9
                      pr-3
                      py-3
                      text-sm
                      sm:text-base
                      outline-none
                      transition-all
                      focus:ring-2
                      focus:ring-[#6b2122]/30
                      focus:border-[#6b2122]
                      focus:shadow-md
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            {/* Correo y teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group min-w-0">
                <label
                  htmlFor="register-email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                  <input
                    id="register-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    disabled={isLoading}
                    className="
                      w-full
                      min-w-0
                      bg-[#fdfbf7]
                      border
                      border-gray-200
                      rounded-xl
                      pl-9
                      pr-3
                      py-3
                      text-sm
                      sm:text-base
                      outline-none
                      transition-all
                      focus:ring-2
                      focus:ring-[#6b2122]/30
                      focus:border-[#6b2122]
                      focus:shadow-md
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                    placeholder="tu@empresa.com"
                  />
                </div>
              </div>

              <div className="group min-w-0">
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
                >
                  Teléfono
                </label>

                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                  <input
                    id="register-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    disabled={isLoading}
                    className="
                      w-full
                      min-w-0
                      bg-[#fdfbf7]
                      border
                      border-gray-200
                      rounded-xl
                      pl-9
                      pr-3
                      py-3
                      text-sm
                      sm:text-base
                      outline-none
                      transition-all
                      focus:ring-2
                      focus:ring-[#6b2122]/30
                      focus:border-[#6b2122]
                      focus:shadow-md
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                    placeholder="+52 000 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* Contraseña */}
            <div className="group">
              <label
                htmlFor="register-password"
                className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
              >
                Contraseña
              </label>

              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                <input
                  id="register-password"
                  type={showRegPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="
                    w-full
                    min-w-0
                    bg-[#fdfbf7]
                    border
                    border-gray-200
                    rounded-xl
                    pl-9
                    pr-11
                    py-3
                    text-sm
                    sm:text-base
                    outline-none
                    transition-all
                    focus:ring-2
                    focus:ring-[#6b2122]/30
                    focus:border-[#6b2122]
                    focus:shadow-md
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                  placeholder="Crea una contraseña segura"
                />

                <button
                  type="button"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-[#6b2122] transition-colors p-1 rounded-md"
                  aria-label={
                    showRegPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showRegPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {regPassword.length > 0 && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex justify-between items-center gap-3 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      Seguridad:
                    </span>

                    <span
                      className={`text-xs font-bold ${passwordStrengthTextClass}`}
                    >
                      {strengthData.text}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthData.color} transition-all duration-500`}
                      style={{ width: strengthData.width }}
                    />
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-500 mt-2 leading-relaxed">
                    Usa al menos 6 caracteres e incluye mayúsculas, números o
                    símbolos.
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="group">
              <label
                htmlFor="register-confirm-password"
                className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
              >
                Confirmar contraseña
              </label>

              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                <input
                  id="register-confirm-password"
                  type={showRegConfirmPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className={`
                    w-full
                    min-w-0
                    bg-[#fdfbf7]
                    border
                    rounded-xl
                    pl-9
                    pr-11
                    py-3
                    text-sm
                    sm:text-base
                    outline-none
                    transition-all
                    focus:ring-2
                    focus:shadow-md
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    ${
                      regConfirmPassword &&
                      regPassword !== regConfirmPassword
                        ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
                        : "border-gray-200 focus:ring-[#6b2122]/30 focus:border-[#6b2122]"
                    }
                  `}
                  placeholder="Repite tu contraseña"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowRegConfirmPassword((prev) => !prev)
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-[#6b2122] transition-colors p-1 rounded-md"
                  aria-label={
                    showRegConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  {showRegConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {regConfirmPassword &&
                regPassword !== regConfirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium animate-fade-in">
                    Las contraseñas no coinciden.
                  </p>
                )}

              {regConfirmPassword &&
                regPassword === regConfirmPassword && (
                  <p className="text-xs text-green-600 mt-1.5 font-medium animate-fade-in">
                    Las contraseñas coinciden.
                  </p>
                )}
            </div>

            {/* Crear cuenta */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full min-h-12 py-3.5 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                isLoading
                  ? "bg-[#4a1516] cursor-not-allowed opacity-80"
                  : "bg-[#6b2122] hover:bg-[#52191a] hover:shadow-lg active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 leading-relaxed">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setCurrentView("login")}
              className="text-[#6b2122] font-bold hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}