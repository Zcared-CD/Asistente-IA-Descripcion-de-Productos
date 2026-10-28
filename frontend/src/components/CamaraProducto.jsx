
import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, X, CheckCircle } from "lucide-react";

export default function CamaraProducto({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);

  const [activa, setActiva] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const detenerCamara = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      detenerCamara();
    };
  }, []);

  const iniciarCamara = async () => {
    setError("");
    setCargando(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMARA_NO_COMPATIBLE");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setActiva(true);
    } catch (err) {
      detenerCamara();
      setActiva(false);

      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setError(
          "Permiso de cámara denegado. Puedes habilitarlo en la configuración del navegador o subir una imagen."
        );
      } else if (err.name === "NotFoundError") {
        setError("No encontramos una cámara disponible en este dispositivo.");
      } else if (err.name === "NotReadableError") {
        setError("La cámara está ocupada por otra aplicación.");
      } else if (err.message === "CAMARA_NO_COMPATIBLE") {
        setError("Este navegador o conexión no permite utilizar la cámara.");
      } else {
        setError("No fue posible iniciar la cámara.");
      }
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  };

  const capturarFoto = async () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("La cámara todavía no está lista para capturar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("No fue posible procesar la fotografía.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("No se pudo guardar la fotografía.");
          return;
        }

        const archivo = new File(
          [blob],
          `producto-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        detenerCamara();
        onCapture(archivo);
        onClose();
      },
      "image/jpeg",
      0.9
    );
  };

  const cerrar = () => {
    detenerCamara();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cámara del producto"
        className="bg-[#fdfbf7] rounded-3xl shadow-2xl w-full max-w-xl p-5 sm:p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#6b2122] flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Cámara del producto
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Captura una imagen para tu descripción con IA.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar cámara"
            className="p-2 rounded-xl hover:bg-rose-100 text-[#6b2122]"
          >
            <X />
          </button>
        </div>

        <div className="bg-[#241b1b] rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${
              activa ? "block" : "hidden"
            }`}
          />

          {!activa && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
              <CameraOff className="w-12 h-12" />
              <p className="text-sm">Cámara apagada</p>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {!activa ? (
            <button
              type="button"
              onClick={iniciarCamara}
              disabled={cargando}
              className="flex-1 bg-[#6b2122] text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {cargando ? "Abriendo cámara..." : "Permitir y abrir cámara"}
            </button>
          ) : (
            <button
              type="button"
              onClick={capturarFoto}
              className="flex-1 bg-[#6b2122] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Capturar fotografía
            </button>
          )}

          <button
            type="button"
            onClick={cerrar}
            className="px-6 py-3 border border-[#6b2122] text-[#6b2122] rounded-xl font-bold"
          >
            Cancelar
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          La cámara se detendrá al cerrar esta ventana.
          No se enviará ninguna imagen hasta que decidas generar una descripción.
        </p>
      </div>
    </div>
  );
}