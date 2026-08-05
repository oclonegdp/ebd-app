import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogIn, LogOut, Building2, Menu, User, Settings } from 'lucide-react';
import { LoginModal } from './Auth/LoginModal';
import { UserProfileModal } from './Auth/UserProfileModal';
import { storageEngine } from '../lib/storageEngine';
import { getSlugFromURL } from '../lib/urlUtils';

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser, currentTenant, allTenants, switchTenant, logout, viewMode, setViewMode } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const sessionUser = storageEngine.getCurrentUserFromSession();
    const slug = getSlugFromURL();
    // Open login modal automatically on initial load if no session exists AND no store slug was specified
    return !sessionUser && !slug;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="bg-[#16191F] border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Hamburger Toggle Button */}
            {viewMode === 'admin' && currentUser && currentUser.role !== 'customer' && (
              <button
                onClick={() => setIsMobileMenuOpen?.(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 md:hidden flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
                aria-label="Menu Principal"
                title="Abrir Menu de Navegação"
              >
                <Menu className="w-5 h-5 text-yellow-500" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-black text-base sm:text-lg shadow-sm font-mono shrink-0">
              EBD
            </div>
            <div className="overflow-hidden">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                <span className="truncate">EBD ElBravoDantas</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hidden sm:inline-block shrink-0">
                  Multi-Tenant
                </span>
              </span>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate hidden xs:block">Plataforma Oficial de Agendamentos</p>
            </div>
          </div>

          {/* Selo de Loja Ativa (Fixed badge in header) */}
          {currentTenant && (
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 via-[#0F1115] to-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.15)] shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Loja Ativa:</span>
              <span className="text-xs font-black text-yellow-400 font-mono tracking-tight max-w-[130px] lg:max-w-[180px] truncate">
                {currentTenant.name}
              </span>
            </div>
          )}

          {/* Tenant Selector & View Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Multi-Tenant Unit Selector (Hidden on small mobile, available inside mobile drawer) */}
            <div className="hidden lg:flex items-center space-x-2 bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-yellow-500" />
              <select
                value={currentTenant?.id || ''}
                onChange={(e) => switchTenant(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#16191F] text-white">
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle View Mode: Vitrine vs Painel Admin */}
            <button
              onClick={() => setViewMode(viewMode === 'admin' ? 'client' : 'admin')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold active:scale-95 transition-all cursor-pointer shrink-0 ${
                viewMode === 'admin'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-sm'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{viewMode === 'admin' ? 'Ver Vitrine Cliente' : 'Painel Gestor'}</span>
              <span className="sm:hidden">{viewMode === 'admin' ? 'Vitrine' : 'Painel'}</span>
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800 shrink-0">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  title="Editar Meu Perfil e Foto"
                  className="flex items-center space-x-2.5 p-1 rounded-xl bg-[#0F1115] hover:bg-slate-800 border border-slate-800 hover:border-yellow-500/50 transition active:scale-95 cursor-pointer text-left group"
                >
                  <div className="relative">
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        className="w-8 h-8 rounded-lg object-cover border border-yellow-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-500">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black p-0.5 rounded shadow-xs group-hover:scale-110 transition">
                      <Settings className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div className="hidden lg:block pr-1">
                    <p className="text-xs font-bold text-white group-hover:text-yellow-400 transition leading-tight">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Editar Perfil</p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  title="Sair do sistema"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[11px] sm:text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
