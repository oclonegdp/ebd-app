import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, DollarSign, Scissors, TrendingUp, CheckCircle, Link as LinkIcon, Copy, Check, MessageSquare, ExternalLink, Search, Filter, X, Building2, Settings, Edit } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { getStorePublicUrl, getWhatsAppShareUrl } from '../../lib/urlUtils';
import { Appointment } from '../../types';
import { ListSkeleton } from '../UI/LoadingSkeleton';
import { StoreSettingsModal } from './StoreSettingsModal';
import { AppointmentEditModal } from './AppointmentEditModal';

export const OwnerDashboard: React.FC = () => {
  const { currentTenant, setViewMode } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);

  // Appointment Edit Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const loadAppointments = () => {
    if (currentTenant) {
      setAppointments(storageEngine.getAppointments(currentTenant.id));
    }
  };

  useEffect(() => {
    if (currentTenant) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        loadAppointments();
        setIsLoading(false);
      }, 300);

      const handleSync = () => {
        loadAppointments();
      };

      window.addEventListener('ebd_storage_synced', handleSync);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('ebd_storage_synced', handleSync);
      };
    }
  }, [currentTenant]);

  const publicUrl = currentTenant ? getStorePublicUrl(currentTenant.slug) : '';
  const whatsappUrl = currentTenant ? getWhatsAppShareUrl(currentTenant.name, currentTenant.slug) : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const totalRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  // Filtered appointments list
  const filteredAppointments = appointments.filter((apt) => {
    const matchesQuery =
      apt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer_phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;

    return matchesQuery && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Top Banner */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-500 shrink-0" />
            <span>Visão Geral & KPIs da Loja - {currentTenant?.name}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o faturamento, agendamentos diários e desempenho da sua unidade em tempo real.
          </p>
        </div>

        <button
          onClick={() => setIsStoreSettingsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 hover:text-yellow-400 font-bold text-xs border border-slate-700 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Editar Logo & Dados da Loja</span>
        </button>
      </div>

      {/* Unique Link & Showcase Sharing Card */}
      {currentTenant && (
        <div className="bg-gradient-to-r from-[#16191F] via-[#1A1E27] to-[#16191F] border border-yellow-500/30 rounded-xl p-4 sm:p-6 shadow-md relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded border border-yellow-500/20">
                Link de Divulgação Exclusivo
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Vitrine Pública Isolada ({currentTenant.name})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Envie este link direto para os seus clientes no WhatsApp e redes sociais para agendamento exclusivo nesta unidade.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer flex-1 sm:flex-initial"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copiar Link Exclusivo</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex-1 sm:flex-initial"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Enviar no WhatsApp</span>
              </a>

              <button
                onClick={() => setViewMode('client')}
                className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Visualizar Vitrine</span>
                <span className="sm:hidden">Vitrine</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0F1115] border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between font-mono text-xs text-yellow-500 gap-1 break-all">
            <span className="truncate max-w-full">{publicUrl}</span>
            <span className="text-[10px] text-slate-500 font-sans shrink-0">Slug: {currentTenant.slug}</span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Faturamento Estimado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white font-mono">R$ {totalRevenue.toFixed(2)}</p>
          )}
          <p className="text-[10px] text-emerald-400 font-medium">+18.5% em relação ao mês anterior</p>
        </div>

        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Agendamentos Confirmados</span>
            <Calendar className="w-4 h-4 text-yellow-500" />
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white font-mono">{confirmedCount}</p>
          )}
          <p className="text-[10px] text-slate-400 font-medium">Horários agendados pelos clientes</p>
        </div>

        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Atendimentos Concluídos</span>
            <CheckCircle className="w-4 h-4 text-yellow-500" />
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white font-mono">{completedCount}</p>
          )}
          <p className="text-[10px] text-slate-400 font-medium">Serviços finalizados com sucesso</p>
        </div>

        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total de Registros</span>
            <Scissors className="w-4 h-4 text-yellow-500" />
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white font-mono">{appointments.length}</p>
          )}
          <p className="text-[10px] text-slate-400 font-medium">Histórico geral da unidade</p>
        </div>
      </div>

      {/* Appointments List with Search & Filtering */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Últimos Agendamentos Recebidos</span>
              {filteredAppointments.length !== appointments.length && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  {filteredAppointments.length} de {appointments.length}
                </span>
              )}
            </h2>
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 w-48 sm:w-60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#0F1115] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0F1115] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-500 capitalize"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || dateFilter) && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                title="Limpar Filtros"
              >
                <X className="w-3 h-3 text-red-400" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Content with Loading Skeleton */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Filter className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Nenhum agendamento encontrado com os filtros atuais.</p>
                {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-yellow-500 underline font-semibold cursor-pointer"
                  >
                    Redefinir filtros de pesquisa
                  </button>
                )}
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white">{apt.customer_name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      WhatsApp: <span className="font-mono text-slate-300">{apt.customer_phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs font-mono text-yellow-500 font-bold">
                        {apt.date} - {apt.start_time}
                      </p>
                      <p className="text-[11px] font-mono text-white">R$ {apt.price?.toFixed(2)}</p>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase font-mono ${
                        apt.status === 'confirmed'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.25)]'
                          : apt.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                          : 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          apt.status === 'confirmed'
                            ? 'bg-yellow-400 animate-pulse'
                            : apt.status === 'completed'
                            ? 'bg-emerald-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <span>
                        {apt.status === 'confirmed'
                          ? 'Confirmado'
                          : apt.status === 'completed'
                          ? 'Concluído'
                          : 'Cancelado'}
                      </span>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsAptModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 transition cursor-pointer active:scale-95"
                      title="Editar ou Cancelar Agendamento"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <StoreSettingsModal
        isOpen={isStoreSettingsOpen}
        onClose={() => setIsStoreSettingsOpen(false)}
      />

      <AppointmentEditModal
        appointment={selectedAppointment}
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        onUpdated={loadAppointments}
      />
    </div>
  );
};
