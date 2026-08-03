import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Store, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InviteCodeModal: React.FC = () => {
  const { isInviteModalOpen, setIsInviteModalOpen, connectByInviteCode, businesses, setSelectedBusinessId, showToast } = useApp();
  const [code, setCode] = useState('');

  if (!isInviteModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Digite um código de convite ou link.');
      return;
    }
    const success = connectByInviteCode(code);
    if (success) {
      setIsInviteModalOpen(false);
      setCode('');
    }
  };

  const handleQuickConnect = (inviteCode: string) => {
    connectByInviteCode(inviteCode);
    setIsInviteModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Close button */}
        <button
          onClick={() => setIsInviteModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-blue-950/50 to-zinc-900 border-b border-zinc-800 text-center relative">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/25">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Conectar por Código de Convite
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Digite o código ou link exclusivo da sua loja/barbearia para acessar os dados 100% isolados
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Código de Convite do Estabelecimento
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: TONI2026 ou CORTEARTES"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono font-extrabold uppercase tracking-widest text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Exemplos disponíveis no sistema: <code className="text-blue-400 font-bold">TONI2026</code> ou <code className="text-indigo-400 font-bold">CORTEARTES</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
            >
              <span>Entrar no Estabelecimento Isolado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Rápido a Lojas de Exemplo:</span>
            </div>

            <div className="space-y-2">
              {businesses.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleQuickConnect(b.inviteCode)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={b.logoUrl} 
                      alt={b.name} 
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-100 group-hover:text-blue-400 transition">{b.name}</p>
                      <p className="text-[10px] text-zinc-500">Código: <span className="text-emerald-400 font-mono font-bold">{b.inviteCode}</span></p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Os dados deste estabelecimento não se misturam com nenhum outro</span>
        </div>
      </div>
    </div>
  );
};
