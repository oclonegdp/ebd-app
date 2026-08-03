import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Store, LogIn } from 'lucide-react';

export const AccessDeniedScreen: React.FC = () => {
  const { currentUser, setViewMode } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white">Acesso Restrito ao Painel Administrativo</h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          Você está conectado como <span className="text-yellow-500 font-bold">{currentUser?.full_name || 'Cliente'}</span> (Perfil:{' '}
          <span className="capitalize text-white font-mono">{currentUser?.role || 'Cliente'}</span>). As funcionalidades administrativas internas exigem nível de permissão de Dono (Owner) ou Super Admin.
        </p>

        <div className="pt-2 flex flex-col space-y-2">
          <button
            onClick={() => setViewMode('client')}
            className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Ir para a Vitrine de Agendamentos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
