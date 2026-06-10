import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Bot, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [showBotMessage, setShowBotMessage] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: '¡Hola! Soy tu asistente de IA. ¿En qué te puedo ayudar hoy con tu proyecto en Carlsoft?' }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();

    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();

    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: userMsg }
    ]);

    setChatMessage('');
    setIsBotTyping(true);

    try {
      const response = await api.post('/chatbot/', {
        mensaje: userMsg
      });

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.data.respuesta
        }
      ]);

    } catch (error) {
      console.error(error);

      let errorMessage = 'No pude responder en este momento. Intenta nuevamente.';

      if (error.response?.status === 429) {
        errorMessage = 'Has enviado demasiados mensajes. Intenta más tarde.';
      }

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: errorMessage
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isBotTyping, isChatOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isChatOpen ? (
        <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col animate-fade-in origin-bottom-right mb-4">
          <div className="bg-[#6b2122] px-4 py-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-white/20 p-1.5 rounded-lg"><Bot className="w-5 h-5" /></div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-[#6b2122] rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Asistente Carlsoft</h4>
                <p className="text-[10px] text-green-300 font-medium">En línea</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-rose-200 hover:text-white transition-colors bg-white/10 p-1 rounded-md hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>
          <div className="h-72 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#6b2122] text-white self-end rounded-2xl rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 self-start rounded-2xl rounded-bl-sm'}`}>
                {msg.text}
              </div>
            ))}
            {isBotTyping && (
              <div className="bg-white text-gray-700 border border-gray-100 self-start rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendChatMessage} className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
            <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Escribe tu mensaje..." className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-[#6b2122] focus:ring-1 focus:ring-[#6b2122] rounded-full px-4 py-2.5 text-sm outline-none transition-all" />
            <button type="submit" disabled={!chatMessage.trim()} className="bg-[#6b2122] text-white p-2.5 rounded-full hover:bg-[#52191a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      ) : (
        <>
          {showBotMessage && (
            <div className="bg-white text-gray-800 p-4 rounded-2xl shadow-2xl mb-4 border border-rose-100 w-64 origin-bottom-right relative transition-all animate-[bounce_2s_infinite]">
              <button onClick={() => setShowBotMessage(false)} className="absolute top-2 right-2 text-gray-400 hover:text-rose-600 transition-colors bg-gray-50 rounded-full p-1"><X className="w-3 h-3" /></button>
              <p className="text-sm font-medium pr-4 text-gray-700">¡Hola! Soy tu asistente de IA. Da clic aquí para platicar sobre tu proyecto en Carlsoft.</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-rose-100 transform rotate-45"></div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(true)} className="bg-gradient-to-br from-[#6b2122] to-[#4a1516] text-amber-300 p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-[#6b2122]/50 transition-all duration-300 relative group border border-amber-300/20">
            <span className="absolute inset-0 rounded-full bg-[#6b2122] animate-ping opacity-40"></span>
            <Bot className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform" />
          </button>
        </>
      )}
    </div>
  );
}