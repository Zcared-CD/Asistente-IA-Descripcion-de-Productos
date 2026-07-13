import React, { useState } from "react";
import {
  Sparkles,
  Crown,
  User,
  LogOut,
  Menu,
  X,
  History,
  CreditCard,
  Home,
  DollarSign,
  Mail,
  UserPlus,
} from "lucide-react";

import miLogo from "../../assets/logo1.png";

export default function Navbar({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  handleLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const logout = () => {
    setMobileMenuOpen(false);
    handleLogout();
  };

  const desktopLinkClass = (view) =>
    `relative py-2 transition-colors duration-200 hover:text-white ${
      currentView === view
        ? "text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-amber-300"
        : "text-rose-100"
    }`;

  const mobileLinkClass = (view) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition ${
      currentView === view
        ? "bg-white/15 text-white"
        : "text-rose-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2 sm:gap-3 min-w-0 text-left"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0 rounded-full overflow-hidden shadow-lg border border-white/10">
              <img
                src={miLogo}
                alt="Logo Carlsoft"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";

                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = "block";
                  }
                }}
              />

              <Sparkles className="hidden w-6 h-6 text-amber-300 m-auto" />
            </div>

            <div className="min-w-0">
              <h1 className="font-extrabold tracking-tight leading-tight">
                <span className="block sm:inline text-lg sm:text-xl lg:text-2xl text-white">
                  Carlsoft
                </span>

                <span className="block sm:inline sm:ml-2 text-base sm:text-lg lg:text-xl text-amber-300">
                  Product IA
                </span>
              </h1>

              <p className="hidden sm:block text-[10px] lg:text-xs text-rose-200 tracking-[0.2em] lg:tracking-[0.3em] uppercase">
                Intelligent System
              </p>
            </div>
          </button>

          {/* Navegación de escritorio */}
          <div className="hidden lg:flex items-center justify-center gap-7 xl:gap-10 text-sm font-bold">
            <button
              type="button"
              onClick={() => navigateTo("home")}
              className={desktopLinkClass("home")}
            >
              INICIO
            </button>

            <button
              type="button"
              onClick={() => navigateTo("costs")}
              className={desktopLinkClass("costs")}
            >
              COSTOS
            </button>

            <button
              type="button"
              onClick={() => navigateTo("contact")}
              className={desktopLinkClass("contact")}
            >
              CONTACTO
            </button>

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo("historial")}
                  className={desktopLinkClass("historial")}
                >
                  HISTORIAL
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("subscription")}
                  className={desktopLinkClass("subscription")}
                >
                  MI SUSCRIPCIÓN
                </button>
              </>
            )}
          </div>

          {/* Acciones de escritorio */}
          <div className="hidden lg:flex items-center justify-end gap-3 shrink-0">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo("register")}
                  className="text-rose-100 hover:text-white font-semibold text-sm transition"
                >
                  REGISTRARSE
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("login")}
                  className="flex items-center gap-2 bg-[#fdfbf7] text-[#6b2122] px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-white transition"
                >
                  <User className="w-4 h-4" />
                  INICIAR SESIÓN
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <div className="text-sm text-right">
                  <p className="font-semibold text-white max-w-28 truncate">
                    {user.name}
                  </p>

                  {isPremium ? (
                    <span className="text-amber-300 flex items-center justify-end gap-1 text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-rose-200 text-xs">
                      Créditos: {credits}/3
                    </span>
                  )}
                </div>

                {!isPremium && (
                  <button
                    type="button"
                    onClick={() => navigateTo("costs")}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#6b2122] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 hover:from-amber-300 hover:to-amber-400 transition"
                  >
                    <Crown className="w-4 h-4" />
                    UPGRADE
                  </button>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="text-rose-200 hover:text-white transition p-2 rounded-full hover:bg-white/10"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Botón hamburguesa móvil y tablet */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Fondo oscuro */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Menú lateral */}
      <aside
        className={`fixed top-0 right-0 z-[9999] h-dvh w-[85%] max-w-sm bg-[#6b2122] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                <img
                  src={miLogo}
                  alt="Logo Carlsoft"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-extrabold leading-tight">
                  Carlsoft{" "}
                  <span className="text-amber-300">Product IA</span>
                </p>

                <p className="text-[10px] text-rose-200 tracking-[0.2em] uppercase">
                  Intelligent System
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Datos del usuario */}
          {user && (
            <div className="mx-5 mt-5 p-4 rounded-2xl bg-black/20 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-amber-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{user.name}</p>

                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                      <Crown className="w-3.5 h-3.5" />
                      Usuario Premium
                    </span>
                  ) : (
                    <p className="text-xs text-rose-200">
                      Créditos disponibles: {credits}/3
                    </p>
                  )}
                </div>
              </div>

              {!isPremium && (
                <button
                  type="button"
                  onClick={() => navigateTo("costs")}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-[#6b2122] py-2.5 rounded-xl text-sm font-extrabold"
                >
                  <Crown className="w-4 h-4" />
                  MEJORAR PLAN
                </button>
              )}
            </div>
          )}

          {/* Enlaces */}
          <div className="flex-1 px-5 py-6 space-y-2">
            <button
              type="button"
              onClick={() => navigateTo("home")}
              className={mobileLinkClass("home")}
            >
              <Home className="w-5 h-5" />
              Inicio
            </button>

            <button
              type="button"
              onClick={() => navigateTo("costs")}
              className={mobileLinkClass("costs")}
            >
              <DollarSign className="w-5 h-5" />
              Costos
            </button>

            <button
              type="button"
              onClick={() => navigateTo("contact")}
              className={mobileLinkClass("contact")}
            >
              <Mail className="w-5 h-5" />
              Contacto
            </button>

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo("historial")}
                  className={mobileLinkClass("historial")}
                >
                  <History className="w-5 h-5" />
                  Historial
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("subscription")}
                  className={mobileLinkClass("subscription")}
                >
                  <CreditCard className="w-5 h-5" />
                  Mi suscripción
                </button>
              </>
            )}
          </div>

          {/* Autenticación */}
          <div className="p-5 border-t border-white/10">
            {!user ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigateTo("login")}
                  className="w-full flex items-center justify-center gap-2 bg-[#fdfbf7] text-[#6b2122] py-3 rounded-xl font-extrabold"
                >
                  <User className="w-5 h-5" />
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("register")}
                  className="w-full flex items-center justify-center gap-2 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/10 transition"
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-black/20 border border-white/10 py-3 rounded-xl font-bold text-rose-100 hover:bg-black/30 transition"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}