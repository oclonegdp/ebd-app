import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Store, 
  LayoutDashboard, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { 
    viewMode, 
    setViewMode, 
    activeTab, 
    setActiveTab, 
    notifications, 
    selectedBusiness,
    currentUser,
    setIsAuthModalOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 text-zinc-100 flex items-center justify-between gap-4">
      {/* Left section: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-200">{selectedBusiness.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="capitalize text-blue-400 font-medium">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'schedule' && 'Grade Semanal'}
            {activeTab === 'storefront' && 'Vitrine Pública'}
            {activeTab === 'services' && 'Serviços & Preços'}
            {activeTab === 'staff' && 'Profissionais'}
            {activeTab === 'notifications' && 'Notificações'}
            {activeTab === 'settings' && 'Preferências'}
          </span>
        </div>
      </div>

      {/* Middle section: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente, serviço ou profissional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right section: Status badge + Mode Switcher + Auth */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Aberto para Agendamentos</span>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              setViewMode('admin');
              setActiveTab('dashboard');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition
              ${viewMode === 'admin' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-zinc-400 hover:text-zinc-200'}
            `}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel Admin</span>
          </button>
          <button
            onClick={() => {
              setViewMode('client');
              setActiveTab('storefront');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition
              ${viewMode === 'client' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-zinc-400 hover:text-zinc-200'}
            `}
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vitrine Cliente</span>
          </button>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-zinc-900"></span>
          )}
        </button>

        {/* Auth / Avatar button */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <img 
              src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover border border-blue-500/40"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
};
