import React, { useState } from 'react';
import { 
  Building2, 
  KeyRound, 
  Copy, 
  Check, 
  ShieldCheck, 
  Share2, 
  Lock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TenantHeaderBadge: React.FC = () => {
  const { 
    selectedBusiness, 
    setIsInviteModalOpen, 
    setIsSuperAdminModalOpen,
    currentUser,
    showToast 
  } = useApp();

  const [copied, setCopied] = useState(false);

  const copyShareableLink = () => {
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?code=${selectedBusiness.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast(`Link exclusivo do ${selectedBusiness.name} copiado! Share URL: ${shareUrl}`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
      {/* Left: Active Multi-Tenant Info */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
          <Lock className="w-3.5 h-3.5" />
          <span>Isolamento Multi-Tenant Ativo</span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-extrabold text-white">{selectedBusiness.name}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] text-zinc-400">Código:</span>
          <code className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
            {selectedBusiness.inviteCode}
          </code>
        </div>
      </div>

      {/* Right: Quick Tenant Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={copyShareableLink}
          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-[11px] font-medium flex items-center gap-1.5 transition active:scale-95"
          title="Copiar Link Exclusivo da Loja"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Link Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Copiar Link Exclusivo</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-[11px] font-medium flex items-center gap-1.5 transition"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Entrar por Código</span>
        </button>

        <button
          onClick={() => setIsSuperAdminModalOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/30 text-purple-200 text-[11px] font-semibold flex items-center gap-1.5 transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Painel Super Admin</span>
        </button>
      </div>
    </div>
  );
};
