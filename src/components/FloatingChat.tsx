import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  Sparkles, 
  ChevronDown, 
  RefreshCw, 
  User, 
  Store,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const FloatingChat: React.FC = () => {
  const { selectedBusiness, services, staff } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'ai',
    text: `Olá! Sou o Assistente Virtual da ${selectedBusiness.name}. Como posso ajudar você hoje? Fique à vontade para perguntar sobre nossos serviços, horários, preços ou sobre a equipe!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Context string about the current business to help Gemini give precise answers
  const businessContextPrompt = `
Você é o assistente virtual inteligente da empresa "${selectedBusiness.name}".
Informações do estabelecimento:
- Categoria: ${selectedBusiness.category}
- Descrição: ${selectedBusiness.description}
- Endereço: ${selectedBusiness.address}, ${selectedBusiness.city}
- Telefone/WhatsApp: ${selectedBusiness.phone}
- Horário de Funcionamento: ${selectedBusiness.workingHours}
- Avaliação: ${selectedBusiness.rating} estrelas

Serviços Oferecidos:
${services.filter(s => s.businessId === selectedBusiness.id).map(s => `- ${s.name}: R$ ${s.price.toFixed(2)} (${s.durationMinutes} min) - ${s.description}`).join('\n')}

Equipe de Profissionais:
${staff.filter(st => st.businessId === selectedBusiness.id).map(st => `- ${st.name} (${st.role})`).join('\n')}

Instruções: Responda de forma cortês, objetiva, profissional e em português do Brasil. Se o usuário perguntar sobre agendamentos, oriente-o a clicar no botão "Agendar Horário" presente na vitrine do aplicativo.
`;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Build combined prompt with business context and user question
      const fullPrompt = `${businessContextPrompt}\n\nPergunta do Cliente: "${userMsg.text}"`;

      const response = await fetch('/app/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        // Fallback retry to /api/ai if /app/api/ai fails
        const fallbackRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt }),
        });
        if (!fallbackRes.ok) {
          throw new Error('Falha na resposta do servidor.');
        }
        const fallbackData = await fallbackRes.json();
        const aiMsgText = fallbackData.text || fallbackData.message || 'Desculpe, não consegui obter a resposta no momento.';
        setMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: aiMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await response.json();
      const aiMsgText = data.text || data.message || 'Desculpe, não consegui processar a resposta.';

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Erro ao comunicar com a IA:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: 'Ops! Ocorreu um problema de conexão com a IA. Por favor, tente novamente em alguns instantes.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'Quais os horários de funcionamento?',
    'Quais serviços vocês oferecem?',
    'Como faço para agendar um horário?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition flex items-center gap-2.5 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
          </div>
          <span className="hidden sm:inline">Assistente IA</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-extrabold uppercase tracking-wider">
            Online
          </span>
        </button>
      )}

      {/* Floating Chat Window when opened */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">Assistente Virtual IA</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="IA Ativa"></span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                  {selectedBusiness.name}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              title="Fechar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none p-3 text-xs text-zinc-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Pensando na resposta...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="p-2 bg-zinc-900/90 border-t border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {quickPrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(promptText)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/40 text-[10px] text-zinc-400 hover:text-blue-300 transition shrink-0"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua dúvida aqui..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 transition shadow-md shadow-blue-600/20 shrink-0"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
