import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { X, Send } from "lucide-react";
import chatImg from "../../assets/chat.png";

export default function Chatbot() {
  const [showBotMessage, setShowBotMessage] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "¡Hola! Soy tu asistente de IA. ¿En qué te puedo ayudar hoy con tu proyecto en Carlsoft?",
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const chatEndRef = useRef(null);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();

    const userMsg = chatMessage.trim();

    if (!userMsg || isBotTyping) {
      return;
    }

    setChatHistory((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMsg,
      },
    ]);

    setChatMessage("");
    setIsBotTyping(true);

    try {
      const response = await api.post("/chatbot/", {
        mensaje: userMsg,
      });

      const botResponse =
        response.data?.respuesta ||
        "No pude generar una respuesta en este momento.";

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
        },
      ]);
    } catch (error) {
      console.error("Error del chatbot:", error);

      let errorMessage =
        "No pude responder en este momento. Intenta nuevamente.";

      if (error.response?.status === 429) {
        errorMessage =
          "Has enviado demasiados mensajes. Intenta nuevamente más tarde.";
      } else if (error.response?.status === 401) {
        errorMessage =
          "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleOpenChat = () => {
    setShowBotMessage(false);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatHistory, isBotTyping, isChatOpen]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    if (isChatOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isChatOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsChatOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      className="
        fixed
        z-[9990]
        right-3
        bottom-3
        sm:right-5
        sm:bottom-5
        lg:right-6
        lg:bottom-6
        flex
        flex-col
        items-end
        max-w-[calc(100vw-1.5rem)]
      "
    >
      {isChatOpen ? (
        <div
          className="
            fixed
            inset-3
            z-[9991]
            w-auto
            max-w-none
            max-h-none
            bg-white
            rounded-2xl
            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            overflow-hidden
            border
            border-white/60
            flex
            flex-col
            animate-fade-in
            origin-bottom-right

            sm:static
            sm:inset-auto
            sm:w-[390px]
            sm:max-w-[430px]
            sm:max-h-[calc(100dvh-2rem)]
            sm:rounded-[28px]
            sm:mb-4

            md:w-[430px]
          "
          role="dialog"
          aria-modal="true"
          aria-label="Asistente Carlsoft"
        >
          {/* Encabezado */}
          <div
            className="
              bg-gradient-to-r
              from-[#6b2122]
              via-[#7d2526]
              to-[#4a1516]
              px-4
              py-3
              sm:px-5
              sm:py-4
              flex
              justify-between
              items-center
              text-white
              shrink-0
            "
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="bg-white/5 p-1 rounded-lg">
                  <img
                    src={chatImg}
                    alt="Chatbot Carlsoft"
                    className="
                      w-10
                      h-10
                      sm:w-12
                      sm:h-12
                      rounded-full
                      object-cover
                    "
                  />
                </div>

                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    w-3
                    h-3
                    sm:w-3.5
                    sm:h-3.5
                    bg-green-400
                    border-2
                    border-[#6b2122]
                    rounded-full
                  "
                />
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-sm leading-tight truncate">
                  Asistente Carlsoft
                </h4>

                <p className="text-[10px] text-green-300 font-medium">
                  En línea
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseChat}
              className="
                text-rose-200
                hover:text-white
                transition-colors
                bg-white/10
                p-2
                rounded-lg
                hover:bg-white/20
                shrink-0
              "
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Historial de mensajes */}
          <div
            className="
              flex-1
              min-h-0
              p-3
              sm:p-5
              overflow-y-auto
              overscroll-contain
              flex
              flex-col
              gap-3
              sm:gap-4
              bg-gradient-to-b
              from-[#fdfbf7]
              to-slate-50
            "
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={`${msg.sender}-${idx}`}
                className={`
                  max-w-[88%]
                  sm:max-w-[82%]
                  px-3
                  py-2.5
                  sm:px-4
                  sm:py-3
                  text-sm
                  leading-relaxed
                  shadow-sm
                  break-words
                  whitespace-pre-wrap
                  ${msg.sender === "user"
                    ? "bg-[#6b2122] text-white self-end rounded-2xl rounded-tr-sm"
                    : "bg-white text-gray-700 border border-gray-100 self-start rounded-2xl rounded-tl-sm"
                  }
                `}
              >
                {msg.text}
              </div>
            ))}

            {isBotTyping && (
              <div
                className="
                  bg-white
                  text-gray-700
                  border
                  border-gray-100
                  self-start
                  rounded-2xl
                  rounded-tl-sm
                  p-4
                  shadow-sm
                  flex
                  items-center
                  gap-1.5
                  w-fit
                "
                aria-label="El asistente está escribiendo"
              >
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />

                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />

                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Campo para escribir */}
          <form
            onSubmit={handleSendChatMessage}
            className="
              bg-white
              p-3
              sm:p-4
              border-t
              border-gray-100
              flex
              items-center
              gap-2
              sm:gap-3
              shrink-0
              pb-[max(0.75rem,env(safe-area-inset-bottom))]
            "
          >
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isBotTyping}
              autoComplete="off"
              className="
                flex-1
                min-w-0
                bg-gray-100
                border
                border-transparent
                focus:bg-white
                focus:border-[#6b2122]
                focus:ring-1
                focus:ring-[#6b2122]
                rounded-full
                px-4
                py-2.5
                text-sm
                outline-none
                transition-all
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
              aria-label="Escribe tu mensaje"
            />

            <button
              type="submit"
              disabled={!chatMessage.trim() || isBotTyping}
              className="
                bg-[#6b2122]
                text-white
                p-2.5
                sm:p-3
                rounded-full
                hover:bg-[#52191a]
                transition-colors
                disabled:bg-gray-300
                disabled:cursor-not-allowed
                shadow-md
                shrink-0
              "
              aria-label="Enviar mensaje"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <>
          {showBotMessage && (
            <div
              className="
                bg-white
                text-gray-800
                p-3
                sm:p-4
                rounded-2xl
                shadow-2xl
                mb-3
                sm:mb-4
                border
                border-rose-100
                w-[calc(100vw-1.5rem)]
                max-w-64
                origin-bottom-right
                relative
                transition-all
                animate-[bounce_2s_infinite]
              "
            >
              <button
                type="button"
                onClick={() => setShowBotMessage(false)}
                className="
                  absolute
                  top-2
                  right-2
                  text-gray-400
                  hover:text-rose-600
                  transition-colors
                  bg-gray-50
                  rounded-full
                  p-1
                "
                aria-label="Cerrar mensaje"
              >
                <X className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleOpenChat}
                className="text-left w-full"
              >
                <p className="text-xs sm:text-sm font-medium pr-5 text-gray-700">
                  ¡Hola! Soy tu asistente de IA. Da clic aquí para platicar
                  sobre tu proyecto en Carlsoft.
                </p>
              </button>

              <div
                className="
                  absolute
                  -bottom-2
                  right-6
                  w-4
                  h-4
                  bg-white
                  border-b
                  border-r
                  border-rose-100
                  rotate-45
                "
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenChat}
            className="
              bg-gradient-to-br
              from-[#6b2122]
              to-[#4a1516]
              text-amber-300
              p-1
              rounded-full
              shadow-2xl
              hover:scale-105
              hover:shadow-[#6b2122]/50
              transition-all
              duration-300
              relative
              group
              border
              border-amber-300/20
            "
            aria-label="Abrir asistente Carlsoft"
          >
            <span
              className="
                absolute
                inset-0
                rounded-full
                bg-[#6b2122]
                animate-ping
                opacity-40
              "
            />

            <img
              src={chatImg}
              alt="Chatbot Carlsoft"
              className="
                w-14
                h-14
                sm:w-16
                sm:h-16
                lg:w-20
                lg:h-20
                relative
                z-10
                rounded-full
                object-cover
              "
            />
          </button>
        </>
      )}
    </div>
  );
}