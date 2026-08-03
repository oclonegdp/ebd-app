import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Building, 
  Check, 
  Eye, 
  EyeOff,
  Scissors,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setCurrentUser, 
    selectedBusiness, 
    registerUserAccount,
    loginWithCredentials,
    showToast 
  } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Por favor, informe um e-mail válido.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'login') {
      const result = loginWithCredentials(cleanEmail, password);
      if (result.user) {
        setIsAuthModalOpen(false);
        showToast(`Bem-vindo, ${result.user.name}!`);
      } else {
        showToast(result.error || 'Credenciais inválidas.');
      }
      return;
    }

    // Register Mode: Strictly Client Role (cria conta real no sistema)
    if (!password || password.length < 4) {
      showToast('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    registerUserAccount({
      name: name || (cleanEmail.split('@')[0] || 'Cliente Wally'),
      email: cleanEmail,
      password,
      role: 'client',
      businessId: selectedBusiness.id
    });
    const userObj = {
      id: `usr_client_${Date.now()}`,
      name: name || (cleanEmail.split('@')[0] || 'Cliente Wally'),
      email: cleanEmail,
      role: 'client' as UserRole,
      businessId: selectedBusiness.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '(11) 99888-7766'
    };
    setCurrentUser(userObj);
    setIsAuthModalOpen(false);
    showToast(`Bem-vindo, ${userObj.name}! Conta de cliente cadastrada em ${selectedBusiness.name}.`);
  };

  const handleDemoClientLogin = () => {
    const clientUser = {
      id: 'usr_client_demo',
      name: 'Cliente Vinculado',
      email: 'cliente@gmail.com',
      role: 'client' as UserRole,
      businessId: selectedBusiness.id,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      phone: '(11) 99123-4567'
    };

    setCurrentUser(clientUser);
    setIsAuthModalOpen(false);
    showToast(`Conectado como Cliente em ${selectedBusiness.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-800/80 to-zinc-900 border-b border-zinc-800 text-center relative">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/25">
            Wally
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Área do Cliente' : 'Cadastro de Cliente'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Vinculado a: <span className="font-extrabold text-emerald-400">{selectedBusiness.name}</span>
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Public Notice: Strictly Client Login */}
          <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acesso Exclusivo para Clientes</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              O cadastro público cria contas de cliente vinculadas diretamente à loja <strong className="text-white">{selectedBusiness.name}</strong>. Admins do SaaS e Profissionais têm acesso via credenciais administrativas separadas.
            </p>
            <button
              type="button"
              onClick={handleDemoClientLogin}
              className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-200 text-[11px] font-bold transition text-center"
            >
              Entrar como Cliente Demo (1-Clique)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.98] mt-2"
            >
              <span>{mode === 'login' ? 'Entrar como Cliente' : 'Cadastrar Minha Conta de Cliente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-5 text-center text-xs text-zinc-400">
            {mode === 'login' ? (
              <p>
                Ainda não tem conta de cliente?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui conta de cliente?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Fazer Login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer security badge */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Isolamento Multi-Tenant Garantido por Loja</span>
        </div>
      </div>
    </div>
  );
};
