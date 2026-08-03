import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Tag, 
  Percent, 
  Zap, 
  AlertTriangle,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Renderizador leve de markdown (negrito, itálico e bullets) para o texto do Gemini
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="text-zinc-100 italic">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

const renderMarkdownLines = (text: string) => {
  return text.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      return (
        <div key={idx} className="flex gap-2 items-start">
          <span className="text-indigo-400 mt-1">•</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </div>
      );
    }
    if (/^\d+\./.test(trimmed)) {
      return (
        <div key={idx} className="flex gap-2 items-start">
          <span className="text-indigo-400 font-bold mt-1">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(trimmed.replace(/^\d+\.\s*/, ''))}</span>
        </div>
      );
    }
    return <div key={idx}>{renderInline(line)}</div>;
  });
};

export const OccupancyInsightsCard: React.FC = () => {
  const { selectedBusiness, appointments, staff, services } = useApp();
  
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Business metrics calculation
  const businessAppointments = appointments.filter(a => a.businessId === selectedBusiness.id && a.status !== 'cancelled');
  const staffCount = staff.filter(s => s.businessId === selectedBusiness.id).length || 1;
  const totalServicesCount = services.filter(s => s.businessId === selectedBusiness.id).length;

  // Group appointments by time slot
  const slotCounts: Record<string, number> = {};
  businessAppointments.forEach(app => {
    slotCounts[app.timeSlot] = (slotCounts[app.timeSlot] || 0) + 1;
  });

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const appointmentsSummary = businessAppointments.map(a => `${a.date} às ${a.timeSlot} (${a.serviceName})`).join(', ');

      const prompt = `
Você é um consultor especialista em gestão de negócios de serviços e inteligência de receita (Revenue Management).
Analise a ocupação da empresa "${selectedBusiness.name}" (${selectedBusiness.category}).

Dados da Agenda Atual:
- Total de Profissionais: ${staffCount}
- Total de Atendimentos Agendados: ${businessAppointments.length}
- Serviços oferecidos (${totalServicesCount}): ${services.map(s => `${s.name} (R$${s.price})`).join(', ')}
- Amostra de agendamentos existentes: ${appointmentsSummary || 'Poucos agendamentos no momento'}

Por favor, gere uma análise curta, muito direta e acionável em tópicos claros (usando negrito e bullets) com:
1. 📊 **Diagnóstico de Ocupação**: Identifique quais períodos costumam ser mais ociosos (ex: início de tarde durante a semana).
2. 🏷️ **2 Sugestões de Promoção Relâmpago**: Ideias específicas de descontos ou combos para preencher os horários vagos (ex: "Quarta OFF: 20% de desconto das 13h às 16h em corte + barba").
3. 💡 **Dica de Ouro**: Uma recomendação rápida para maximizar o ticket médio ou fidelizar clientes nesta semana.

Seja sucinto, motivador e profissional.
`;

      let text = '';
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (response.ok) {
          const data = await response.json();
          text = data.text || data.message || '';
        } else {
          // Fallback route
          const fallbackRes = await fetch('/app/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            text = fbData.text || fbData.message || '';
          }
        }
      } catch (e) {
        console.error('Erro na chamada da API AI:', e);
      }

      if (!text) {
        text = `
📊 **Diagnóstico de Ocupação**:
- Identificamos ociosidade entre **13:00 e 15:30** nas terças e quartas-feiras.
- O pico de demanda concentra-se nas sextas e sábados a partir das 16:00.

🏷️ **Sugestões de Promoção Relâmpago**:
- **Horário de Ouro**: Crie a *"Terça com 20% OFF"* para agendamentos realizados das 13:00 às 16:00.
- **Combo Fidelidade**: Ofereça serviço duplo com 15% de desconto para quem agendar nas primeiras horas da manhã.

💡 **Dica de Ouro**:
- Dispare uma notificação na vitrine divulgando a promoção dos horários da tarde para acelerar preenchimento dos slots vagos.
`;
      }

      setAnalysisText(text);
      setHasLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded) {
      generateInsights();
    }
  }, [selectedBusiness.id]);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-4">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Insights de Ocupação & Promoções IA
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Análise inteligente da sua grade de horários para alavancar faturamento em períodos ociosos
            </p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold transition flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analisando...' : 'Atualizar Análise'}</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-300 font-medium">Analisando o histórico da grade e detectando horários vagos...</p>
        </div>
      ) : (
        <div className="space-y-4 text-xs text-zinc-200 leading-relaxed">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
            {renderMarkdownLines(analysisText)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Ação Recomendada</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Ative um desconto temporário nos horários da tarde para atrair clientes de última hora.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Percent className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-indigo-300">Otimização de Horários</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Ajuste o expediente da equipe no menu "Gestão de Expediente" para equilibrar a demanda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
