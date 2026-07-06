import React, { useState } from "react";
import api from "../api/axios";
import {
  Camera,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Download,
  Lock,
  Crown,
  Cpu,
  Type,
  Tag,
  Brain,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import NetworkParticles from "../components/ui/NetworkParticles";

const customStyles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-150px * 5)); }
  }
  .animate-carousel {
    animation: scroll 20s linear infinite;
    display: flex;
    width: calc(150px * 10);
  }
  .carousel-item {
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export default function Home({
  currentView,
  setCurrentView,
  user,
  isPremium,
  credits,
  setCredits,
  handleLogout,
}) {
  const [productName, setProductName] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("Comercial");
  const [imageInstruction, setImageInstruction] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [advertisingPrompt, setAdvertisingPrompt] = useState('');
  const [loadingAdvertising, setLoadingAdvertising] = useState(false);
  const [result, setResult] = useState(null);
  const [advertisingImage, setAdvertisingImage] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  const [imagePreviewModal, setImagePreviewModal] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setSelectedImage(file);
      setImageFile(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Por favor inicia sesión primero.");
      setCurrentView("login");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Tu sesión expiró.");
      setCurrentView("login");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();

      formData.append("nombre_producto", productName);
      formData.append("palabras_clave", productDetails);
      formData.append('marca', brand);
      formData.append('categoria', category);
      formData.append('color', color);
      formData.append('material', material);
      formData.append('publico_objetivo', targetAudience);
      formData.append('tono', tone);
      formData.append('instruccion_imagen', imageInstruction);

      if (selectedImage) {
        formData.append("imagen_producto", selectedImage);
      }

      const response = await api.post("/generar-descripcion/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      setCredits(data.creditos);

      setResult({
        producto: data.producto,
        title: data.producto.titulo_generado,
        description: data.producto.descripcion_generada,
        tags: productDetails
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        imageUrl:
          imageFile ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      });
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.error ||
        "Error al generar la descripción.";

      if (error.response?.status === 403) {
        setAlertModal({
          title: "Límite alcanzado",
          message: mensaje,
          actionText: "Ver planes",
          action: () => {
            setAlertModal(null);
            setCurrentView("costs");
          },
        });
      } else if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAlertModal({
          title: "Sesión expirada",
          message: "Tu sesión expiró. Inicia sesión nuevamente.",
          actionText: "Iniciar sesión",
          action: () => {
            setAlertModal(null);
            setCurrentView("login");
          },
        });
      } else {
        setAlertModal({
          title: "Error",
          message: mensaje,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generarPublicidad = async () => {
    if (!result?.producto?.id) {
      alert("Primero genera una descripción.");
      return;
    }

    try {
      setLoadingAdvertising(true);

      const response = await api.post(
        `/productos/${result.producto.id}/generar-imagen-publicitaria/`
      );

      console.log("RESPUESTA IMAGEN IA:", response.data);

      const imagenGenerada =
        response.data.imagen_publicitaria_url ||
        response.data.producto?.imagen_publicitaria_url ||
        response.data.producto?.imagen_publicitaria;

      setAdvertisingPrompt(
        response.data.prompt_imagen_publicitaria ||
        response.data.producto?.prompt_imagen_publicitaria
      );

      if (imagenGenerada) {
        setAdvertisingImage(imagenGenerada);
      } else {
        alert("La imagen se generó, pero no llegó la URL desde el backend.");
      }
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.error ||
        "No se pudo generar la imagen publicitaria.";

      if (error.response?.status === 403) {
        setAlertModal({
          title: "Límite de imágenes alcanzado",
          message: mensaje,
          actionText: "Ver planes",
          action: () => {
            setAlertModal(null);
            setCurrentView("costs");
          },
        });
      } else {
        setAlertModal({
          title: "Error al generar imagen",
          message: mensaje,
        });
      }
    } finally {
      setLoadingAdvertising(false);
    }
  };

  const extraerSeccion = (texto, titulo) => {
    if (!texto) return "";

    const regex = new RegExp(
      `${titulo}:\\s*([\\s\\S]*?)(?=\\n[A-ZÁÉÍÓÚÑ ]+:|$)`,
      "i"
    );

    const match = texto.match(regex);
    return match ? match[1].trim() : "";
  };


  const copiarTexto = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("Texto copiado.");
    } catch {
      alert("No se pudo copiar.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <style>{customStyles}</style>

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

        <div className="relative z-10 py-16 px-6 max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-black/20 text-rose-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10 shadow-sm">
            <Brain className="w-4 h-4 text-amber-300" />
            GENERADOR INTELIGENTE DE PRODUCTOS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Crea Descripciones Perfectas <br />
            con Inteligencia Artificial
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light mb-12">
            Sube tu producto, añade unas palabras clave y deja que nuestro motor
            de IA genere descripciones, etiquetas y presentaciones listas para
            tus campañas.
          </p>

          <div className="w-full bg-black/10 backdrop-blur-md py-6 rounded-2xl border border-white/5 overflow-hidden relative shadow-inner">
            <p className="text-xs text-rose-200/60 uppercase tracking-[0.2em] font-bold mb-4">
              Empresas que podrían usar esta tecnología
            </p>
            <div className="w-full overflow-hidden flex relative">
              <div className="animate-carousel">
                {[1, 2].map((group) => (
                  <React.Fragment key={group}>
                    <div className="carousel-item">
                      <img
                        src="RUTA_LOGO_NIKE.png"
                        alt="Nike"
                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="hidden text-white/50 font-bold text-xl tracking-widest">
                        NIKE
                      </span>
                    </div>
                    <div className="carousel-item">
                      <img
                        src="RUTA_LOGO_ADIDAS.png"
                        alt="Adidas"
                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="hidden text-white/50 font-bold text-xl tracking-widest">
                        ADIDAS
                      </span>
                    </div>
                    <div className="carousel-item">
                      <img
                        src="RUTA_LOGO_PUMA.png"
                        alt="Puma"
                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="hidden text-white/50 font-bold text-xl tracking-widest">
                        PUMA
                      </span>
                    </div>
                    <div className="carousel-item">
                      <img
                        src="RUTA_LOGO_APPLE.png"
                        alt="Apple"
                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="hidden text-white/50 font-bold text-xl tracking-widest">
                        APPLE
                      </span>
                    </div>
                    <div className="carousel-item">
                      <img
                        src="RUTA_LOGO_SAMSUNG.png"
                        alt="Samsung"
                        className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <span className="hidden text-white/50 font-bold text-xl tracking-widest">
                        SAMSUNG
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#6b2122] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#6b2122] to-transparent pointer-events-none"></div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10"
          style={{ transform: "translateY(1px)" }}
        >
          <svg
            className="relative block w-full h-12 md:h-20"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C-1,95.8,73.1,86.6,144,79.2,204.3,72.9,263.6,67.2,321.39,56.44Z"
              fill="#fdfbf7"
            ></path>
          </svg>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20 flex-1 w-full animate-fade-in">
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-rose-50/50 rounded-2xl shadow-xl border border-rose-100 p-8 h-fit relative transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#6b2122] rounded-b-lg opacity-30"></div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#6b2122]">
            <Cpu className="w-8 h-8 p-1.5 bg-rose-50/80 rounded-lg text-[#6b2122] border border-rose-100 shadow-sm" />
            Configuración del Proyecto
          </h2>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">
                Nombre del Producto / Marca
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                </div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej. Zapatillas Running X"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 shadow-sm focus:-translate-y-1 focus:shadow-md"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej. Nike, Samsung, Oster"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ej. Ropa, tecnología, cocina"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej. Negro, blanco, rojo"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ej. Algodón, acero, plástico"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Público objetivo
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ej. Jóvenes, deportistas, hogar"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tono
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all"
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Elegante">Elegante</option>
                  <option value="Juvenil">Juvenil</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Premium">Premium</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Marketplace">Marketplace</option>
                </select>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">
                Características clave o palabras clave
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-[#6b2122] transition-colors" />
                </div>
                <textarea
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="Ej. Alta velocidad, amortiguación ligera, diseño aerodinámico..."
                  rows="4"
                  className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#6b2122] focus:border-[#6b2122] outline-none transition-all duration-300 resize-none shadow-sm focus:-translate-y-1 focus:shadow-md"
                ></textarea>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#6b2122] transition-colors">
                Imagen de Referencia
              </label>
              <div className="border-2 border-dashed border-[#6b2122]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-[#fdfbf7] hover:bg-rose-50 hover:border-[#6b2122]/50 transition-all duration-300 cursor-pointer relative group overflow-hidden hover:shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imageFile ? (
                  <img
                    src={imageFile}
                    alt="Preview"
                    className="h-32 object-contain rounded-lg shadow-md mb-3"
                  />
                ) : (
                  <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-[#6b2122]/60" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-600">
                  {imageFile
                    ? "Click para cambiar imagen"
                    : "Arrastra una imagen o haz click"}
                </span>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instrucciones para imagen publicitaria
              </label>
              <textarea
                value={imageInstruction}
                onChange={(e) => setImageInstruction(e.target.value)}
                placeholder="Ej. Fondo blanco tipo Amazon, diseño premium, luces elegantes, estilo Instagram..."
                rows="3"
                className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6b2122] outline-none transition-all resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition shadow-lg ${isGenerating ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-[#6b2122] hover:bg-[#52191a] hover:-translate-y-1"}`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                  Procesando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />{" "}
                  {user ? "Generar Descripción" : "Inicia Sesión para Generar"}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white flex-1 rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative transform transition-all duration-500 hover:shadow-2xl">
            <div className="bg-gray-50 border-b border-gray-100 p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                <img
                  src="RUTA_DE_TU_ICONO_AQUI.png"
                  alt="Icono Resultado"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <ImageIcon className="w-6 h-6 text-[#6b2122] hidden" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Resultado Generado
              </h2>
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Procesando con Inteligencia Artificial
                    </h3>
                    <p className="text-[#6b2122] font-medium animate-pulse">
                      Analizando variables y generando descripción óptima...
                    </p>
                  </div>
                </div>
              ) : !result ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <div className="w-24 h-24 bg-[#fdfbf7] border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-[#6b2122]/20" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    El panel está vacío
                  </h3>
                  <p className="max-w-sm">
                    Completa el formulario a la izquierda y presiona el botón
                    para que la IA haga su magia.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-white group">
                    <img
                      src={result.imageUrl}
                      alt="Producto Generado"
                      className="w-full h-80 object-cover bg-gray-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {!isPremium && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[#6b2122] shadow-lg flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Marca de agua
                      </div>
                    )}
                    <h3 className="absolute bottom-6 left-6 right-6 text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                      {result.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Producto</p>
                      <p className="text-lg font-bold text-gray-800">{productName}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Marca</p>
                      <p className="text-lg font-bold text-gray-800">{brand || 'No especificada'}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Categoría</p>
                      <p className="text-lg font-bold text-gray-800">{category || 'General'}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tono</p>
                      <p className="text-lg font-bold text-gray-800">{tone}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        ["Título", extraerSeccion(result.description, "TÍTULO")],
                        ["Descripción corta", extraerSeccion(result.description, "DESCRIPCIÓN CORTA")],
                        ["Características clave", extraerSeccion(result.description, "CARACTERÍSTICAS CLAVE")],
                        ["Beneficios", extraerSeccion(result.description, "BENEFICIOS")],
                        ["Uso recomendado", extraerSeccion(result.description, "USO RECOMENDADO")],
                        ["Público objetivo", extraerSeccion(result.description, "PÚBLICO OBJETIVO")],
                        ["Análisis visual", extraerSeccion(result.description, "ANÁLISIS VISUAL")],
                        ["Hashtags", extraerSeccion(result.description, "HASHTAGS")],
                      ].map(([titulo, contenido]) => (
                        contenido && (
                          <div key={titulo} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-lg font-extrabold text-[#6b2122]">
                                {titulo}
                              </h4>

                              <button
                                onClick={() => copiarTexto(contenido)}
                                className="text-sm font-bold bg-rose-50 text-[#6b2122] px-4 py-2 rounded-xl hover:bg-rose-100 transition"
                              >
                                Copiar
                              </button>
                            </div>

                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {contenido}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#fdfbf7] p-6 rounded-xl border border-rose-100 shadow-sm">
                    <h4 className="text-lg font-extrabold text-[#6b2122] mb-4">
                      Datos inteligentes del producto
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tipo detectado</p>
                        <p className="text-gray-800 font-semibold">
                          {extraerSeccion(result.description, "TIPO DE PRODUCTO") || category || "General"}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Apariencia visual</p>
                        <p className="text-gray-800 font-semibold">
                          {extraerSeccion(result.description, "ANÁLISIS VISUAL") || color || "No especificada"}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Público sugerido</p>
                        <p className="text-gray-800 font-semibold">
                          {extraerSeccion(result.description, "PÚBLICO OBJETIVO") || targetAudience || "General"}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Uso recomendado</p>
                        <p className="text-gray-800 font-semibold">
                          {extraerSeccion(result.description, "USO RECOMENDADO") || "Ecommerce, retail o catálogo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {imageInstruction && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-extrabold text-[#6b2122]">
                          Instrucción para imagen publicitaria
                        </h4>

                        <button
                          onClick={() => copiarTexto(imageInstruction)}
                          className="text-sm font-bold bg-rose-50 text-[#6b2122] px-4 py-2 rounded-xl hover:bg-rose-100 transition"
                        >
                          Copiar
                        </button>
                      </div>

                      <p className="text-gray-700">{imageInstruction}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                    <h4 className="text-lg font-extrabold text-[#6b2122] mb-3">
                      Imagen publicitaria IA
                    </h4>

                    <p className="text-gray-600 text-sm mb-4">
                      Genera un prompt profesional para crear una imagen publicitaria del producto.
                    </p>

                    <button
                      onClick={generarPublicidad}
                      disabled={loadingAdvertising}
                      className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg ${loadingAdvertising
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#6b2122] hover:bg-[#52191a] hover:-translate-y-1"
                        }`}
                    >
                      {loadingAdvertising
                        ? "Generando prompt publicitario..."
                        : "✨ Generar prompt para imagen publicitaria"}
                    </button>

                    {advertisingImage && (
                      <div className="mt-6">
                        <h4 className="text-lg font-extrabold text-[#6b2122] mb-4">
                          Banner Publicitario
                        </h4>

                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                          <img
                            src={advertisingImage}
                            alt="Banner Publicitario"
                            onClick={() => setImagePreviewModal(advertisingImage)}
                            className="w-full h-[350px] object-contain bg-white cursor-zoom-in"
                          />
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Vista previa del banner publicitario.
                        </p>
                        <a
                          href={advertisingImage}
                          download={`banner-publicitario-${result?.producto?.id || "ia"}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center justify-center gap-2 bg-[#6b2122] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#52191a] transition"
                        >
                          <Download className="w-5 h-5" />
                          Descargar imagen
                        </a>
                      </div>
                    )}

                    {advertisingPrompt && (
                      <div className="mt-5 bg-white p-5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-bold text-[#6b2122]">
                            Prompt generado
                          </h5>

                          <button
                            onClick={() => copiarTexto(advertisingPrompt)}
                            className="bg-rose-50 text-[#6b2122] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-rose-100"
                          >
                            Copiar
                          </button>
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                          {advertisingPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {alertModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-100 flex items-center justify-center">
              <Lock className="w-10 h-10 text-[#6b2122]" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#6b2122] mb-3">
              {alertModal.title}
            </h3>

            <p className="text-gray-600 mb-6">
              {alertModal.message}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setAlertModal(null)}
                className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
              >
                Cerrar
              </button>

              {alertModal.actionText && (
                <button
                  onClick={alertModal.action}
                  className="px-5 py-3 rounded-xl bg-[#6b2122] text-white font-bold hover:bg-[#52191a]"
                >
                  {alertModal.actionText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {imagePreviewModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center px-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setImagePreviewModal(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-bold"
            >
              ×
            </button>

            <img
              src={imagePreviewModal}
              alt="Imagen completa"
              className="w-full max-h-[85vh] object-contain rounded-2xl bg-white"
            />

            <a
              href={imagePreviewModal}
              download="banner-publicitario.png"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 mx-auto w-fit flex items-center gap-2 bg-white text-[#6b2122] px-5 py-3 rounded-xl font-bold"
            >
              <Download className="w-5 h-5" />
              Descargar
            </a>
          </div>
        </div>
      )}
      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}
