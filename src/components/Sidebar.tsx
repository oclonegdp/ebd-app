import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  ShieldCheck,
  Building2,
  X,
  Store,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { currentUser, currentTenant, allTenants, switchTenant } = useAuth();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isOwner = currentUser?.role === 'owner' || isSuperAdmin;
  const isStaff = currentUser?.role === 'staff';

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const navContent = (
    <nav className="space-y-1">
      {/* Super Admin Section */}
      {isSuperAdmin && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 px-3 mb-2 font-mono">
            Gestão SaaS Mestre
          </p>
          <button
            onClick={() => handleSelectTab('superadmin_dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'superadmin_dashboard'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Painel Super Admin</span>
          </button>
        </div>
      )}

      {/* Owner Section */}
      {isOwner && (
        <div className="mb-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Gestão da Loja
          </p>
          <button
            onClick={() => handleSelectTab('owner_dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'owner_dashboard'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão Geral & KPIs</span>
          </button>

          <button
            onClick={() => handleSelectTab('weekly_schedule')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'weekly_schedule'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Grade de Agendamentos</span>
          </button>

          <button
            onClick={() => handleSelectTab('services_manager')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'services_manager'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Catálogo de Serviços</span>
          </button>

          <button
            onClick={() => handleSelectTab('staff_manager')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'staff_manager'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe de Profissionais</span>
          </button>

          <button
            onClick={() => handleSelectTab('business_hours')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'business_hours'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Horários de Expediente</span>
          </button>
        </div>
      )}

      {/* Staff Section */}
      {isStaff && !isOwner && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Área do Profissional
          </p>
          <button
            onClick={() => handleSelectTab('staff_dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer ${
              activeTab === 'staff_dashboard'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Minha Agenda Pessoal</span>
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#16191F] border-r border-slate-800 p-4 shrink-0 hidden md:block min-h-[calc(100vh-4rem)]">
        {/* Current Tenant Banner */}
        <div className="mb-6 p-3 rounded-xl bg-[#0F1115] border border-slate-800 flex items-center space-x-3">
          <img
            src={currentTenant?.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&auto=format&fit=crop&q=80'}
            alt={currentTenant?.name}
            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentTenant?.name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentTenant?.slug}</p>
          </div>
        </div>

        {navContent}
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen?.(false)}
          />

          {/* Drawer Content Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[#16191F] border-r border-slate-800 p-5 h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center font-black text-sm font-mono shrink-0">
                  EBD
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Menu de Navegação</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Gestão Administrativa</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen?.(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tenant Banner & Switcher for Mobile */}
            <div className="mb-5 p-3 rounded-xl bg-[#0F1115] border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={currentTenant?.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&auto=format&fit=crop&q=80'}
                  alt={currentTenant?.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentTenant?.name}</p>
                  <p className="text-[10px] text-yellow-500 font-mono truncate">{currentTenant?.slug}</p>
                </div>
              </div>

              {allTenants.length > 1 && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Unidade Selecionada:</label>
                  <div className="flex items-center space-x-2 bg-[#16191F] border border-slate-700 rounded-lg px-2.5 py-1.5">
                    <Building2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <select
                      value={currentTenant?.id || ''}
                      onChange={(e) => switchTenant(e.target.value)}
                      className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {allTenants.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#16191F] text-white">
                          {t.name} ({t.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Items */}
            <div className="flex-1">
              {navContent}
            </div>

            {/* Drawer Footer User Info */}
            {currentUser && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="overflow-hidden pr-2">
                  <p className="font-bold text-white truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-yellow-500 uppercase font-mono tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

