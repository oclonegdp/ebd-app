import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus, 
  ArrowUpRight, 
  Phone, 
  MessageSquare,
  ChevronRight,
  Sparkles,
  Scissors,
  Store,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppointmentStatus } from '../types';
import { OccupancyInsightsCard } from './OccupancyInsightsCard';

export const DashboardView: React.FC = () => {
  const { 
    selectedBusiness, 
    appointments, 
    services, 
    staff, 
    updateAppointmentStatus, 
    openBookingModal, 
    setActiveTab,
    setSelectedStaffForAgenda,
    currentUser
  } = useApp();

  // Filter appointments for selected business and role
  const isStaffRole = currentUser?.role === 'staff';
  const rawBusinessAppointments = appointments.filter(a => a.businessId === selectedBusiness.id);
  const businessAppointments = isStaffRole && currentUser?.staffId
    ? rawBusinessAppointments.filter(a => a.staffId === currentUser.staffId)
    : rawBusinessAppointments;

  // Today's ISO date YYYY-MM-DD
  const todayIso = new Date().toISOString().split('T')[0];
  const todayAppointments = businessAppointments.filter(a => a.date === todayIso);

  // Stats Calculations
  const todayCount = todayAppointments.length;
  
  // Total estimated revenue for confirmed/completed appointments this month
  const totalRevenue = businessAppointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

  const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
  const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;

  // Occupation rate approximation (slots filled out of total daily capacity e.g. 18 slots across staff)
  const capacityPerDay = (staff.filter(s => s.businessId === selectedBusiness.id).length || 1) * 8;
  const occupationRate = Math.min(100, Math.round((todayCount / (capacityPerDay || 1)) * 100));

  // Format Brazilian Real
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" /> Pendente
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  const currentBusinessStaff = staff.filter(s => s.businessId === selectedBusiness.id);

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-blue-950/40 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              Painel Geral
            </span>
            <span className="text-xs text-zinc-400">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Visão Geral de Agendamentos
          </h1>
          <p className="text-xs text-zinc-400">
            Acompanhe o movimento de {selectedBusiness.name} em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveTab('schedule')}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Grade Semanal</span>
          </button>
          <button
            onClick={() => openBookingModal()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Agendamentos Hoje */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Agendamentos Hoje</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{todayCount}</span>
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% hoje
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {confirmedCount} confirmados, {pendingCount} pendentes
          </p>
        </div>

        {/* Card 2: Faturamento Estimado */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Faturamento Estimado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white tracking-tight">{formatBRL(totalRevenue)}</span>
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18% mês
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Soma de agendamentos confirmados
          </p>
        </div>

        {/* Card 3: Taxa de Ocupação */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Taxa de Ocupação</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{occupationRate}%</span>
            <span className="text-[11px] font-medium text-indigo-400">
              Capacidade ideal
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupationRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Profissionais Ativos */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Profissionais da Equipe</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentBusinessStaff.length}
            </span>
            <button
              onClick={() => setActiveTab('staff')}
              className="text-[11px] font-medium text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Gerenciar equipe
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Com agendas abertas semanalmente
          </p>
        </div>
      </div>

      {/* Insights de Ocupação & Promoções por IA */}
      <OccupancyInsightsCard />

      {/* Main Grid: Today's Appointments Timeline + Staff Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Agenda de Hoje ({todayCount})
              </h2>
              <p className="text-xs text-zinc-400">Horários e atendimentos do dia</p>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Ver Grade Completa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">Nenhum agendamento para hoje ainda</p>
              <p className="text-xs text-zinc-500">Clique abaixo para adicionar o primeiro agendamento manualmente.</p>
              <button
                onClick={() => openBookingModal()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar Horário</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments
                .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                .map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Time & Client Info */}
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Time slot pill */}
                      <div className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center min-w-[70px]">
                        <span className="block text-sm font-extrabold text-white">{app.timeSlot}</span>
                        <span className="block text-[10px] text-zinc-500 font-medium">{app.durationMinutes} min</span>
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{app.clientName}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          <span className="text-blue-400 font-medium">{app.serviceName}</span> • {formatBRL(app.servicePrice)}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                          <img 
                            src={app.staffAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"} 
                            alt={app.staffName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>Atendido por: <strong className="text-zinc-200">{app.staffName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Status Action Buttons */}
                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800 justify-end">
                      {/* WhatsApp contact link */}
                      <a
                        href={`https://wa.me/${app.clientPhone.replace(/\D/g, '')}?text=Olá ${app.clientName}, confirmamos seu agendamento no ${selectedBusiness.name} para hoje às ${app.timeSlot}!`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 transition"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden xl:inline">WhatsApp</span>
                      </a>

                      {/* Status toggle actions */}
                      {app.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                        >
                          Confirmar
                        </button>
                      )}

                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(app.id, 'completed')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                        >
                          Concluir
                        </button>
                      )}

                      {app.status !== 'cancelled' && app.status !== 'completed' && (
                        <button
                          onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Professionals Availability + Quick Store Link */}
        <div className="space-y-6">
          {/* Staff Cards Card */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Agenda dos Profissionais</span>
              </h3>
              <button
                onClick={() => setActiveTab('staff')}
                className="text-[11px] font-semibold text-blue-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {currentBusinessStaff.map((member) => {
                const memberAppsToday = todayAppointments.filter(a => a.staffId === member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedStaffForAgenda(member);
                      setActiveTab('staff');
                    }}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={member.avatarUrl} 
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-blue-500 transition"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950"></span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                          {member.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs font-bold text-blue-400">
                        {memberAppsToday.length} cliente{memberAppsToday.length !== 1 ? 's' : ''}
                      </span>
                      <span className="block text-[10px] text-zinc-500">Hoje</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vitrine Direct Link Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 via-zinc-900 to-zinc-900 border border-blue-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Sua Vitrine Online</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Sua loja pronta para receber agendamentos!
            </h3>
            <p className="text-xs text-zinc-300">
              Compartilhe o link da sua vitrine pública para que seus clientes agendem sozinhos 24 horas por dia.
            </p>
            <button
              onClick={() => setActiveTab('storefront')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
            >
              <Store className="w-4 h-4" />
              <span>Abrir Vitrine Pública</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
