import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, X, ShieldCheck, Key } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onOpenRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = login(email);
    if (success) {
      onClose();
    } else {
      setErrorMsg('E-mail não encontrado. Utilize um dos atalhos rápidos abaixo para testar.');
    }
  };

  const handleQuickSuperAdmin = () => {
    login('superadmin@ebd.com');
    onClose();
  };

  const handleQuickLoginRole = (targetEmail: string) => {
    login(targetEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center mx-auto mb-2 font-black text-xl font-mono">
            EBD
          </div>
          <h2 className="text-xl font-bold text-white">EBD ElBravoDantas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Acesse sua conta no SaaS Multi-Tenant</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer"
          >
            Entrar no Painel
          </button>
        </form>

        {/* Preset Quick Login Section */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider text-center font-bold">
            Atalhos Rápidos por Nível de Permissão (RBAC)
          </p>

          <button
            onClick={handleQuickSuperAdmin}
            className="w-full py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold text-xs hover:bg-yellow-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Entrar como Super Admin Mestre</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLoginRole('anamaria@ebdbarber.com')}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
            >
              Dono da Loja (Owner)
            </button>
            <button
              onClick={() => handleQuickLoginRole('mariana@ebdbarber.com')}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
            >
              Profissional (Staff)
            </button>
          </div>
        </div>

        {/* Registration by invitation link */}
        <div className="mt-4 pt-3 text-center border-t border-slate-800/80">
          <button
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="text-xs text-yellow-500 hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Possui Código de Convite? Registrar Loja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
