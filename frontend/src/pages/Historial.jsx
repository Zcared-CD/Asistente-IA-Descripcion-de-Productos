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

  return (
    <div className="flex flex-col min-h-screen w-full">
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

        <div className="relative z-10 py-12 px-6 max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-4">Historial de Descripciones</h1>
          <p className="text-rose-100 font-light text-lg">
            .
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(1px)' }}>
          <svg className="relative block w-full h-12 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z" fill="#fdfbf7"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-8 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6b2122]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por producto, marca, categoría o palabra clave..."
            className="w-full outline-none text-gray-700"
          />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="w-8 h-8 border-4 border-[#6b2122] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando historial...</p>
          </div>
        ) : historialFiltrado.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-[#6b2122] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay resultados</h2>
            <p className="text-gray-500 mb-6">
              Genera una descripción o intenta con otra búsqueda.
            </p>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-[#6b2122] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#52191a] transition"
            >
              Generar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {historialFiltrado.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="md:col-span-1 bg-[#fdfbf7] min-h-[220px] flex items-center justify-center border-r border-gray-100">
                    {obtenerImagenPrincipal(item) ? (
                      <img
                        src={obtenerImagenPrincipal(item)}
                        alt={item.nombre_producto}
                        onClick={() => setImagenCompleta(obtenerImagenPrincipal(item))}
                        className="w-full h-full object-contain bg-white cursor-zoom-in"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-[#6b2122] flex items-center gap-2">
                          <FileText className="w-6 h-6" />
                          {item.nombre_producto}
                        </h2>

                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(item.fecha_creacion).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() => verDetalle(item)}
                          className="flex items-center justify-center gap-2 bg-[#6b2122] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#52191a] transition"
                        >
                          Ver detalle
                        </button>
                        <button
                          onClick={() => copiarTexto(item.descripcion_generada)}
                          className="flex items-center justify-center gap-2 bg-rose-50 text-[#6b2122] px-4 py-2 rounded-xl font-bold border border-rose-100 hover:bg-rose-100 transition"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </button>

                        <button
                          onClick={() => eliminarItem(item.id)}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold uppercase text-gray-400">Marca</p>
                        <p className="font-semibold text-gray-700">{item.marca || 'No especificada'}</p>
                      </div>

                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold uppercase text-gray-400">Categoría</p>
                        <p className="font-semibold text-gray-700">{item.categoria || 'General'}</p>
                      </div>

                      <div className="bg-[#fdfbf7] p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold uppercase text-gray-400">Tono</p>
                        <p className="font-semibold text-gray-700">{item.tono || 'Comercial'}</p>
                      </div>
                    </div>

                    <div className="bg-[#fdfbf7] border border-gray-100 rounded-xl p-5 max-h-64 overflow-y-auto">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {item.descripcion_generada}
                      </p>
                    </div>

                    {item.prompt_imagen_publicitaria && (
                      <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-4">
                        <p className="text-xs font-bold uppercase text-[#6b2122] mb-1">
                          Prompt publicitario
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-[#6b2122]">
                {productoSeleccionado.nombre_producto}
              </h2>

              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">

              {obtenerImagenPrincipal(productoSeleccionado) && (
                <div className="mb-6">
                  <img
                    src={obtenerImagenPrincipal(productoSeleccionado)}
                    alt={productoSeleccionado.nombre_producto}
                    onClick={() => setImagenCompleta(obtenerImagenPrincipal(productoSeleccionado))}
                    className="w-full max-h-[420px] object-contain bg-white rounded-xl border cursor-zoom-in"
                  />

                  <button
                    onClick={() =>
                      descargarImagen(
                        obtenerImagenPrincipal(productoSeleccionado),
                        `imagen-${productoSeleccionado.nombre_producto}.png`
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 bg-[#6b2122] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#52191a]"
                  >
                    <Download className="w-5 h-5" />
                    Descargar imagen
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                <div className="bg-[#fdfbf7] p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 uppercase">Marca</p>
                  <p className="font-bold">{productoSeleccionado.marca || 'N/A'}</p>
                </div>

                <div className="bg-[#fdfbf7] p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 uppercase">Categoría</p>
                  <p className="font-bold">{productoSeleccionado.categoria || 'N/A'}</p>
                </div>

                <div className="bg-[#fdfbf7] p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 uppercase">Color</p>
                  <p className="font-bold">{productoSeleccionado.color || 'N/A'}</p>
                </div>

                <div className="bg-[#fdfbf7] p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 uppercase">Material</p>
                  <p className="font-bold">{productoSeleccionado.material || 'N/A'}</p>
                </div>

              </div>

              <div className="bg-[#fdfbf7] rounded-xl border p-5 mb-6">
                <h3 className="font-bold text-[#6b2122] mb-3">
                  Descripción Generada
                </h3>

                <p className="whitespace-pre-wrap text-gray-700">
                  {productoSeleccionado.descripcion_generada}
                </p>
              </div>

              {productoSeleccionado.prompt_imagen_publicitaria && (
                <div className="bg-rose-50 rounded-xl border border-rose-100 p-5">
                  <h3 className="font-bold text-[#6b2122] mb-3">
                    Prompt Publicitario
                  </h3>

                  <p className="whitespace-pre-wrap text-gray-700">
                    {productoSeleccionado.prompt_imagen_publicitaria}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {imagenCompleta && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] p-4 shadow-2xl">
            <button
              onClick={() => setImagenCompleta(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#6b2122] text-white text-2xl font-bold flex items-center justify-center hover:bg-[#52191a]"
            >
              ×
            </button>

            <img
              src={imagenCompleta}
              alt="Imagen completa"
              className="w-full max-h-[75vh] object-contain rounded-xl bg-white"
            />

            <button
              onClick={() => descargarImagen(imagenCompleta, 'imagen-publicitaria.png')}
              className="mt-4 mx-auto w-fit flex items-center gap-2 bg-[#6b2122] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#52191a]"
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