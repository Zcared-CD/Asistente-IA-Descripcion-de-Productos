import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import api from "../api/axios";
import GoogleButton from "../components/forms/GoogleButton";
import NetworkParticles from "../components/ui/NetworkParticles";

export default function Login({
  setUser,
  setIsPremium,
  setCredits,
  setCurrentView,
}) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = await api.post("/login/", {
        username: loginEmail.trim(),
        password: loginPassword,
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
      setCurrentView("home");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      if (error.response?.status === 401) {
        alert(
          "Credenciales incorrectas. Verifica tu correo y contraseña."
        );
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert(
          "Error de conexión con el servidor. Verifica que Django esté encendido."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[#6b2122]">
      <NetworkParticles />

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

          <span className="truncate">
            Regresar al inicio
          </span>
        </button>
      </div>

      <main className="relative z-10 flex min-h-[calc(100dvh-4rem)] items-center justify-center px-3 py-6 sm:px-6 sm:py-8">
        <div
          className="
            w-full
            max-w-md
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
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#6b2122]/10 rounded-full mb-4">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#6b2122]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
              Bienvenido de nuevo
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Inicia sesión para continuar
            </p>
          </div>

          <GoogleButton text="Continuar con Google" />

          <div className="relative flex items-center justify-center my-5 sm:my-6">
            <div className="border-t border-gray-200 w-full absolute" />

            <span className="bg-white px-3 sm:px-4 text-[10px] sm:text-xs text-gray-400 relative z-10 font-semibold uppercase tracking-wider text-center">
              O usa tu correo
            </span>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="group">
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[#6b2122] transition-colors"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
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
                    pl-10
                    pr-4
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

            <div className="group">
              <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5 mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-gray-700 group-focus-within:text-[#6b2122] transition-colors"
                >
                  Contraseña
                </label>

                <button
                  type="button"
                  onClick={() => alert("Recuperación de contraseña próximamente.")}
                  className="w-fit text-xs font-semibold text-[#6b2122] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-[#6b2122] transition-colors" />

                <input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="
                    w-full
                    min-w-0
                    bg-[#fdfbf7]
                    border
                    border-gray-200
                    rounded-xl
                    pl-10
                    pr-12
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
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowLoginPassword((prev) => !prev)
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-[#6b2122] transition-colors p-1 rounded-md"
                  aria-label={
                    showLoginPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full min-h-12 py-3.5 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${isLoading
                  ? "bg-[#4a1516] cursor-not-allowed opacity-80"
                  : "bg-[#6b2122] hover:bg-[#52191a] hover:shadow-lg active:scale-[0.99]"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 leading-relaxed">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setCurrentView("register")}
              className="text-[#6b2122] font-bold hover:underline"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}