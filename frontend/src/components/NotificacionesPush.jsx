
import { useEffect, useState } from "react";
import api from "../api/axios";

function convertirClaveVapid(clave) {
  const padding = "=".repeat((4 - (clave.length % 4)) % 4);
  const base64 = (clave + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const datos = atob(base64);

  return Uint8Array.from(datos, (caracter) =>
    caracter.charCodeAt(0)
  );
}

export default function NotificacionesPush() {
  const [permiso, setPermiso] = useState("default");
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!("Notification" in window)) return;

    setPermiso(Notification.permission);

    async function verificarSuscripcion() {
      if (!("serviceWorker" in navigator)) return;

      try {
        const registro = await navigator.serviceWorker.ready;
        const suscripcion =
          await registro.pushManager.getSubscription();

        setSuscrito(Boolean(suscripcion));
      } catch (error) {
        console.error("Error verificando suscripción:", error);
      }
    }

    verificarSuscripcion();
  }, []);

  const activarNotificaciones = async () => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setMensaje("Este navegador no admite Web Push.");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const resultado = await Notification.requestPermission();
      setPermiso(resultado);

      if (resultado !== "granted") {
        setMensaje(
          resultado === "denied"
            ? "Las notificaciones fueron bloqueadas."
            : "No se concedió el permiso."
        );
        return;
      }

      // Obtener la clave pública desde Django.
      const respuestaClave = await api.get("/push/public-key/");
      const clavePublica = respuestaClave.data.publicKey;

      const registro = await navigator.serviceWorker.ready;

      let suscripcion =
        await registro.pushManager.getSubscription();

      if (!suscripcion) {
        suscripcion = await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertirClaveVapid(clavePublica)
        });
      }

      // Guardar el dispositivo en Django.
      await api.post(
        "/push/subscribe/",
        suscripcion.toJSON()
      );

      setSuscrito(true);
      setMensaje("Notificaciones push activadas correctamente.");

    } catch (error) {
      console.error("Error activando notificaciones:", error);
      setMensaje(
        error.response?.data?.error ||
        "No se pudo registrar el dispositivo."
      );
    } finally {
      setCargando(false);
    }
  };

  const probarNotificacion = async () => {
    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await api.post("/push/test/");

      setMensaje(
        respuesta.data.message ||
        "Notificación enviada."
      );
    } catch (error) {
      console.error("Error enviando push:", error);
      setMensaje(
        error.response?.data?.error ||
        "No fue posible enviar la notificación."
      );
    } finally {
      setCargando(false);
    }
  };

  const desactivarNotificaciones = async () => {
    setCargando(true);
    setMensaje("");

    try {
      const registro = await navigator.serviceWorker.ready;
      const suscripcion =
        await registro.pushManager.getSubscription();

      if (suscripcion) {
        await api.post("/push/unsubscribe/", {
          endpoint: suscripcion.endpoint
        });

        await suscripcion.unsubscribe();
      }

      setSuscrito(false);
      setMensaje("Notificaciones desactivadas.");

    } catch (error) {
      console.error("Error desactivando push:", error);
      setMensaje("No se pudieron desactivar las notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="mx-auto my-8 w-full max-w-lg rounded-3xl border border-[#ead8ca] bg-[#fffaf4] p-6 shadow-xl">

      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-[#f5e3d0] p-3 text-2xl">
          🔔
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#6b2122]">
            Notificaciones Carlsoft
          </h2>
          <p className="text-sm text-[#816860]">
            Recibe avisos de tus créditos y descripciones
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-white p-4">
        <p className="text-sm font-semibold text-[#6b2122]">
          Estado de notificaciones
        </p>

        <p className="mt-1 text-sm text-gray-600">
          {permiso === "denied"
            ? "Bloqueadas por el navegador"
            : suscrito
              ? "Activadas en este dispositivo"
              : "No activadas"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!suscrito ? (
          <button
            type="button"
            onClick={activarNotificaciones}
            disabled={cargando || permiso === "denied"}
            className="rounded-xl bg-[#6b2122] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {cargando
              ? "Configurando..."
              : "Activar notificaciones"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={probarNotificacion}
              disabled={cargando}
              className="rounded-xl bg-[#6b2122] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              Enviar notificación push de prueba
            </button>

            <button
              type="button"
              onClick={desactivarNotificaciones}
              disabled={cargando}
              className="rounded-xl border border-[#6b2122] px-5 py-3 font-semibold text-[#6b2122]"
            >
              Desactivar notificaciones
            </button>
          </>
        )}
      </div>

      {mensaje && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-[#f5e9dc] p-3 text-sm text-[#6b2122]"
        >
          {mensaje}
        </p>
      )}

    </section>
  );
}
