import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, X, Key, Store, CheckSquare, Square } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onOpenRegister: () => void;
}

const REMEMBER_KEY_EMAIL = 'ebd_remembered_email';
const REMEMBER_KEY_CHECK = 'ebd_remember_me_active';

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onOpenRegister }) => {
  const { login, setViewMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem(REMEMBER_KEY_CHECK) === 'true';
      const savedEmail = localStorage.getItem(REMEMBER_KEY_EMAIL) || '';

      if (isRemembered && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.error('Error reading saved credentials:', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = login(email, password);
    if (success) {
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_KEY_CHECK, 'true');
          localStorage.setItem(REMEMBER_KEY_EMAIL, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY_CHECK);
          localStorage.removeItem(REMEMBER_KEY_EMAIL);
        }
      } catch (e) {
        console.error('Error saving remember credentials:', e);
      }

      onClose();
    } else {
      setErrorMsg('E-mail ou senha incorretos. Por favor, verifique suas credenciais de acesso.');
    }
  };

  const handleOpenVitrine = () => {
    setViewMode('client');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition"
          title="Fechar Janela de Login"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center mx-auto mb-2 font-black text-xl font-mono">
            EBD
          </div>
          <h2 className="text-xl font-bold text-white">EBD ElBravoDantas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Acesse seu Painel com E-mail e Senha Privada</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail de Acesso</label>
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
            <label className="text-xs font-semibold text-slate-300 block mb-1">Senha de Acesso</label>
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-yellow-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
               <span className="text-xs font-medium">Lembrar e-mail neste dispositivo</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer active:scale-95"
          >
            Entrar no Painel
          </button>
        </form>

        {/* Footer Actions: Client Vitrine vs Invitation Register */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={handleOpenVitrine}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Store className="w-4 h-4 text-yellow-500" />
            <span>Sou Cliente - Acessar Vitrine de Agendamento</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="w-full text-xs text-yellow-500 hover:underline font-semibold flex items-center justify-center gap-1.5 pt-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Possui Código de Convite? Registrar Loja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
