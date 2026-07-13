import React, { useEffect, useState } from 'react';
import {
  Clock,
  FileText,
  Copy,
  AlertCircle,
  Trash2,
  Search,
  Image as ImageIcon,
  Download,
  X,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NetworkParticles from '../components/ui/NetworkParticles';
import api from '../api/axios';

export default function Historial({ currentView, setCurrentView, user, isPremium, credits, handleLogout }) {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [imagenCompleta, setImagenCompleta] = useState(null);

  const obtenerImagenPrincipal = (item) => {
    return (
      item.imagen_publicitaria ||
      item.imagen_publicitaria_url ||
      item.imagen_producto ||
      null
    );
  };

  useEffect(() => {
    const cargarHistorial = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setCurrentView('login');
        return;
      }

      try {
        const response = await api.get('/historial/');
        setHistorial(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setCurrentView('login');
        } else {
          alert('Error al cargar el historial.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    cargarHistorial();
  }, [setCurrentView]);

  const copiarTexto = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert('Texto copiado al portapapeles.');
    } catch {
      alert('No se pudo copiar el texto.');
    }
  };

  const eliminarItem = async (id) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar esta descripción del historial?');

    if (!confirmar) return;

    try {
      await api.delete(`/historial/${id}/eliminar/`);

      setHistorial((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el registro.');
    }
  };

  const verDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  };

  const historialFiltrado = historial.filter((item) => {
    const texto = `${item.nombre_producto} ${item.marca || ''} ${item.categoria || ''} ${item.palabras_clave || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const descargarImagen = async (url, nombre = 'imagen-publicitaria.png') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    const modalAbierto = mostrarModal || Boolean(imagenCompleta);

    document.body.style.overflow = modalAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mostrarModal, imagenCompleta]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <header className="relative bg-[#6b2122] text-[#fdfbf7] overflow-hidden shadow-xl shrink-0 w-full">
        <NetworkParticles />
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          isPremium={isPremium}
          credits={credits}
          handleLogout={handleLogout}
        />

        <div className="relative z-10 pt-8 pb-14 sm:pt-10 sm:pb-16 lg:py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 sm:mb-4 leading-tight">
            Historial de Descripciones
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-rose-100 font-light max-w-2xl mx-auto">
            Consulta, copia y administra las descripciones generadas anteriormente.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-10 sm:h-12 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full min-w-0 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 mb-6 sm:mb-8 flex items-center gap-3 min-w-0">
          <Search className="w-5 h-5 text-[#6b2122] shrink-0" />

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto, marca o categoría..."
            className="w-full min-w-0 outline-none text-sm sm:text-base text-gray-700 bg-transparent"
          />

          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-[#6b2122] hover:bg-rose-50 transition"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center">
            <div className="w-8 h-8 border-4 border-[#6b2122] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando historial...</p>
          </div>
        ) : historialFiltrado.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center border border-gray-100">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#6b2122] mx-auto mb-4" />

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No hay resultados
            </h2>

            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Genera una descripción o intenta con otra búsqueda.
            </p>

            <button
              type="button"
              onClick={() => setCurrentView("home")}
              className="w-full sm:w-auto bg-[#6b2122] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#52191a] transition"
            >
              Generar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {historialFiltrado.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition min-w-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 min-w-0">
                  {/* Imagen */}
                  <div className="md:col-span-1 bg-[#fdfbf7] h-52 sm:h-64 md:h-auto md:min-h-[220px] flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 overflow-hidden">
                    {obtenerImagenPrincipal(item) ? (
                      <img
                        src={obtenerImagenPrincipal(item)}
                        alt={item.nombre_producto}
                        onClick={() =>
                          setImagenCompleta(obtenerImagenPrincipal(item))
                        }
                        className="w-full h-full object-contain bg-white cursor-zoom-in"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />

                        <p className="text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="md:col-span-3 p-4 sm:p-6 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 min-w-0">
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#6b2122] flex items-start gap-2 min-w-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 mt-1 shrink-0" />

                          <span className="break-words min-w-0">
                            {item.nombre_producto}
                          </span>
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-start gap-2">
                          <Clock className="w-4 h-4 mt-0.5 shrink-0" />

                          <span>
                            {new Date(item.fecha_creacion).toLocaleString("es-MX", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 lg:flex gap-2 w-full lg:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => verDetalle(item)}
                          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#6b2122] text-white px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#52191a] transition"
                        >
                          Ver detalle
                        </button>

                        <button
                          type="button"
                          onClick={() => copiarTexto(item.descripcion_generada)}
                          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-rose-50 text-[#6b2122] px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold border border-rose-100 hover:bg-rose-100 transition"
                        >
                          <Copy className="w-4 h-4 shrink-0" />
                          Copiar
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarItem(item.id)}
                          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Datos resumidos */}
                    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100 min-w-0">
                        <p className="text-xs font-bold uppercase text-gray-400">
                          Marca
                        </p>

                        <p className="font-semibold text-gray-700 break-words">
                          {item.marca || "No especificada"}
                        </p>
                      </div>

                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100 min-w-0">
                        <p className="text-xs font-bold uppercase text-gray-400">
                          Categoría
                        </p>

                        <p className="font-semibold text-gray-700 break-words">
                          {item.categoria || "General"}
                        </p>
                      </div>

                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100 min-w-0 min-[420px]:col-span-2 sm:col-span-1">
                        <p className="text-xs font-bold uppercase text-gray-400">
                          Tono
                        </p>

                        <p className="font-semibold text-gray-700 break-words">
                          {item.tono || "Comercial"}
                        </p>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-[#fdfbf7] border border-gray-100 rounded-xl p-4 sm:p-5 max-h-64 overflow-y-auto overscroll-contain">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {item.descripcion_generada}
                      </p>
                    </div>

                    {/* Prompt */}
                    {item.prompt_imagen_publicitaria && (
                      <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-4 min-w-0">
                        <p className="text-xs font-bold uppercase text-[#6b2122] mb-1">
                          Prompt publicitario
                        </p>

                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {item.prompt_imagen_publicitaria}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {mostrarModal && productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-3 sm:p-4"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del producto"
          >
            <div className="shrink-0 bg-white border-b px-4 py-4 sm:p-5 flex justify-between items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#6b2122] break-words min-w-0">
                {productoSeleccionado.nombre_producto}
              </h2>

              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                aria-label="Cerrar detalle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain min-w-0">
              {obtenerImagenPrincipal(productoSeleccionado) && (
                <div className="mb-6">
                  <img
                    src={obtenerImagenPrincipal(productoSeleccionado)}
                    alt={productoSeleccionado.nombre_producto}
                    onClick={() =>
                      setImagenCompleta(
                        obtenerImagenPrincipal(productoSeleccionado)
                      )
                    }
                    className="w-full max-h-[280px] sm:max-h-[420px] object-contain bg-white rounded-xl border cursor-zoom-in"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      descargarImagen(
                        obtenerImagenPrincipal(productoSeleccionado),
                        `imagen-${productoSeleccionado.nombre_producto}.png`
                      )
                    }
                    className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6b2122] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#52191a]"
                  >
                    <Download className="w-5 h-5" />
                    Descargar imagen
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  ["Marca", productoSeleccionado.marca || "N/A"],
                  ["Categoría", productoSeleccionado.categoria || "N/A"],
                  ["Color", productoSeleccionado.color || "N/A"],
                  ["Material", productoSeleccionado.material || "N/A"],
                ].map(([titulo, contenido]) => (
                  <div
                    key={titulo}
                    className="bg-[#fdfbf7] p-4 rounded-xl border min-w-0"
                  >
                    <p className="text-xs text-gray-400 uppercase">
                      {titulo}
                    </p>

                    <p className="font-bold break-words">
                      {contenido}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-[#fdfbf7] rounded-xl border p-4 sm:p-5 mb-6 min-w-0">
                <h3 className="font-bold text-[#6b2122] mb-3">
                  Descripción Generada
                </h3>

                <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-gray-700 leading-relaxed">
                  {productoSeleccionado.descripcion_generada}
                </p>
              </div>

              {productoSeleccionado.prompt_imagen_publicitaria && (
                <div className="bg-rose-50 rounded-xl border border-rose-100 p-4 sm:p-5 min-w-0">
                  <h3 className="font-bold text-[#6b2122] mb-3">
                    Prompt Publicitario
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-gray-700 leading-relaxed">
                    {productoSeleccionado.prompt_imagen_publicitaria}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {imagenCompleta && (
        <div
          className="fixed inset-0 z-[10001] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setImagenCompleta(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[calc(100dvh-1.5rem)] p-3 sm:p-4 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImagenCompleta(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6b2122] text-white flex items-center justify-center hover:bg-[#52191a] transition"
              aria-label="Cerrar imagen"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </button>

            <img
              src={imagenCompleta}
              alt="Imagen completa"
              className="w-full flex-1 min-h-0 max-h-[70dvh] sm:max-h-[75dvh] object-contain rounded-xl bg-white"
            />

            <button
              type="button"
              onClick={() =>
                descargarImagen(imagenCompleta, "imagen-publicitaria.png")
              }
              className="mt-3 sm:mt-4 mx-auto w-full sm:w-fit flex items-center justify-center gap-2 bg-[#6b2122] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#52191a]"
            >
              <Download className="w-5 h-5" />
              Descargar imagen
            </button>
          </div>
        </div>
      )}
      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}