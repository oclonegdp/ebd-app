import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock,
  Store, 
  Scissors, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  ChevronDown,
  Building2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    notifications, 
    currentUser, 
    setIsAuthModalOpen, 
    setCurrentUser,
    selectedBusiness,
    businesses,
    setSelectedBusinessId,
    setViewMode,
    openBookingModal,
    isStaff,
    isSuperAdminUser
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const allNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'schedule', label: 'Grade Semanal', icon: <Calendar className="w-5 h-5" /> },
    { id: 'expediente', label: 'Gestão de Expediente', icon: <Clock className="w-5 h-5" /> },
    { id: 'storefront', label: 'Vitrine da Empresa', icon: <Store className="w-5 h-5" /> },
    { id: 'services', label: 'Serviços & Preços', icon: <Scissors className="w-5 h-5" /> },
    { id: 'staff', label: 'Profissionais', icon: <Users className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notificações', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
    { id: 'settings', label: 'Preferências', icon: <Settings className="w-5 h-5" /> },
  ];

  // RBAC: cada papel vê apenas o que pode acessar
  const navItems = isStaff
    ? [{ id: 'minha-agenda' as ActiveTab, label: 'Minha Agenda & Rendimentos', icon: <Calendar className="w-5 h-5" /> }]
    : allNavItems;

  // Isolamento: super admin alterna entre todas; admin (dono) vê apenas a própria empresa
  const availableBusinessesForUser = isSuperAdminUser
    ? businesses
    : businesses.filter(b => b.id === selectedBusiness.id);

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 text-zinc-100 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0
      ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
      {/* Top Header & Brand */}
      <div>
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm tracking-wider">
                EBD
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">EBD</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate max-w-[130px]">ElBravoDantasOficial</p>
              </div>
            </div>
          </div>

          {/* Business Switcher (apenas gestão; dono vê só a própria empresa) */}
          {!isStaff && (
            <div className="mt-4">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Empresa Ativa
              </label>
              <div className="relative">
                <select
                  value={selectedBusiness.id}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-8 hover:border-zinc-600 transition"
                >
                  {availableBusinessesForUser.map((b) => (
                    <option key={b.id} value={b.id} className="bg-zinc-900 text-zinc-200">
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Novo Agendamento (apenas dono/super admin) */}
        {!isStaff && (
          <div className="px-4 pt-4">
            <button
              onClick={() => openBookingModal()}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Menu Principal
          </p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border-l-2 border-blue-500 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200 transition'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Account Card */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        {/* Quick View Mode Toggle (apenas dono/super admin) */}
        {!isStaff && (
          <button
            onClick={() => {
              setViewMode('client');
              setActiveTab('storefront');
            }}
            className="w-full mb-3 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-medium flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Ver Vitrine Pública</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* User Card */}
        {currentUser ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-100 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              title="Sair da conta"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <UserIcon className="w-4 h-4" />
            <span>Entrar na Conta</span>
          </button>
        )}
      </div>
    </aside>
  );
};
