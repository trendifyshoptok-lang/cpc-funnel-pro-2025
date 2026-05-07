import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Search } from 'lucide-react';
import { generateAIResponse } from '../services/gemini';

export const AIAssistant: React.FC<{ contextPrompt?: string }> = ({ contextPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string, urls?: string[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  //  Rolagem automática sempre que chegam novas mensagens
  useEffect(() => {
    const box = document.getElementById("ai-messages");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const fullPrompt = contextPrompt 
        ? `Contexto: ${contextPrompt}\n\nPergunta: ${userMsg}\nResponda em Português (Brasil).`
        : userMsg;

      const model = 'gemini-1.5-flash-001';

      const res = await generateAIResponse(fullPrompt, model, useSearch);

      const text =
        typeof res.text === 'string' && res.text.trim() !== ''
          ? res.text
          : 'Sem resposta.';

      setMessages(prev => [...prev, { role: 'ai', text, urls: res.urls }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro ao conectar com a IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[76px] md:bottom-6 right-4 md:right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-white p-4 rounded-full hover:scale-105 transition flex items-center gap-2"
          style={{ background: 'var(--ai-accent)', boxShadow: '0 4px 14px var(--ai-accent-shadow)' }}
        >
          <Bot size={24} />
          <span className="font-semibold hidden md:inline">Assistente IA</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-2rem)] max-w-[350px] md:w-[450px] md:max-w-none flex flex-col h-[480px] md:h-[500px] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom">
          
          {/* Header */}
          <div className="p-4 flex justify-between items-center text-white" style={{ background: 'var(--ai-accent)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h3 className="font-bold">Assistente Gemini</h3>
            </div>
            <button className="hover:bg-white/20 rounded-full p-1" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Chat container */}
          <div id="ai-messages" className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 mt-10">
                <Bot size={48} className="mx-auto mb-2 opacity-50" />
                <p>Pergunte-me qualquer coisa sobre campanhas e estratégias.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm
                  ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {(m.urls?.length ?? 0) > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold mb-1">Fontes:</p>
                      {(m.urls ?? []).map((u, idx) => (
                        <a key={idx} href={u} target="_blank"
                           className="block text-xs text-blue-500 truncate hover:underline">
                          {new URL(u).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 rounded-full px-4 py-2 text-xs text-slate-500 animate-pulse">Pensando...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs text-slate-600 mb-2 cursor-pointer">
              <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} />
              <Search size={12} />
              Usar Pesquisa Google
            </label>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => (e.key === 'Enter') && !loading && handleSend()}
                placeholder="Digite sua pergunta..."
                className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:border-blue-500"
              />

              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-700"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
