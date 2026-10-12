
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timeout;

    const handleOnline = () => {
      setOffline(false);
      timeout = setTimeout(() => setVisible(false), 450);
    };

    const handleOffline = () => {
      clearTimeout(timeout);
      setOffline(true);
      setDismissed(false);
      setVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!visible || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes carlsoftEnter {
          from { opacity: 0; transform: translate(-50%, -25px) scale(.94); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        @keyframes carlsoftPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: .5; }
        }

        @keyframes carlsoftGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(245,158,11,0); }
          50% { box-shadow: 0 0 18px rgba(245,158,11,.4); }
        }

        @keyframes carlsoftSpin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .carlsoft-animated {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        className="carlsoft-animated fixed top-4 left-1/2 z-[99999] w-[calc(100%-2rem)] max-w-md"
        style={{
          animation: "carlsoftEnter .5s ease-out both",
          opacity: offline ? 1 : 0,
          transition: "opacity .4s ease"
        }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#fffaf3] border border-[#eac9a8] shadow-[0_12px_40px_rgba(36,12,12,0.25)]">

          {/* Barra decorativa */}
          <div className="h-1 bg-gradient-to-r from-[#6b2122] via-[#e6ad53] to-[#6b2122]" />

          <div className="p-4">

            <div className="flex items-start gap-3">

              {/* Icono animado */}
              <div
                className="carlsoft-animated relative flex shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-[#fce9d4]"
                style={{
                  animation: "carlsoftGlow 2.5s ease-in-out infinite"
                }}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b3430"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9a15 15 0 0 1 11-3" />
                  <path d="M17 7a15 15 0 0 1 4 2" />
                  <path d="M6 13a9 9 0 0 1 9-2" />
                  <path d="M18 13h.01" />
                  <path d="M12 17h.01" />
                  <path d="M2 2l20 20" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-bold text-[#682225] text-sm">
                    Conexión interrumpida
                  </h3>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fce4d4] text-[#a64a21]">
                    OFFLINE
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#795548] leading-relaxed">
                  Puedes seguir explorando Carlsoft.
                  Las funciones de IA y los pagos necesitan
                  conexión a Internet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Cerrar aviso"
                className="shrink-0 text-[#a58b7b] hover:text-[#682225] transition-colors text-lg"
              >
                ×
              </button>
            </div>

            <div className="h-px bg-[#eedbcc] my-4" />

            {/* Estado animado */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">

                <div
                  className="carlsoft-animated w-2 h-2 rounded-full bg-amber-500"
                  style={{
                    animation: "carlsoftPulse 1.5s infinite"
                  }}
                />

                <span className="text-[11px] text-[#92745d]">
                  Esperando conexión...
                </span>

                <svg
                  className="carlsoft-animated"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b9853c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    animation: "carlsoftSpin 3s linear infinite"
                  }}
                >
                  <path d="M20 11a8 8 0 1 0-2.3 6" />
                  <path d="M20 4v7h-7" />
                </svg>
              </div>

              <span className="text-[10px] font-semibold text-[#a17644]">
                CARLSOFT IA
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
