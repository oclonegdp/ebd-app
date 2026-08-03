import React, { useMemo, useState } from 'react';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Wallet,
  Briefcase,
  Scissors,
  UserCircle2,
  StickyNote
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment, AppointmentStatus } from '../types';

export const StaffPortalView: React.FC = () => {
  const { currentUser, staff, appointments, selectedBusiness, updateAppointmentStatus } = useApp();

  const myStaff = currentUser?.staffId
    ? staff.find(s => s.id === currentUser.staffId)
    : undefined;

  const myAppointments = useMemo(
    () => appointments
      .filter(a => a.businessId === selectedBusiness.id)
      .filter(a => myStaff ? a.staffId === myStaff.id : a.staffName === currentUser?.name)
      .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot)),
    [appointments, selectedBusiness.id, myStaff, currentUser?.name]
  );

  const todayIso = new Date().toISOString().split('T')[0];
  const todayApps = myAppointments.filter(a => a.date === todayIso);
  const pendingToday = todayApps.filter(a => a.status === 'pending');
  const completedCount = myAppointments.filter(a => a.status === 'completed').length;
  const cancelledCount = myAppointments.filter(a => a.status === 'cancelled').length;

  // Rendimentos: soma dos atendimentos concluídos (e confirmados) do profissional
  const totalEarnings = myAppointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);
  const confirmedEarnings = myAppointments
    .filter(a => a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);
  const completedEarnings = myAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');

  const filteredApps = myAppointments.filter(a => {
    if (dateFilter && a.date !== dateFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Confirmado</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30"><AlertCircle className="w-3 h-3" /> Pendente</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30"><CheckCircle2 className="w-3 h-3" /> Concluído</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> Cancelado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Acesso do Profissional
            </span>
            <span className="text-xs text-zinc-400">
              {selectedBusiness.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-emerald-400" />
            Olá, {currentUser?.name || myStaff?.name || 'Profissional'}!
          </h1>
          <p className="text-xs text-zinc-400">
            Aqui você vê apenas a sua agenda e os seus próprios rendimentos.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {myStaff && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <img src={myStaff.avatarUrl} alt={myStaff.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40" />
              <div>
                <p className="text-xs font-bold text-white">{myStaff.name}</p>
                <p className="text-[11px] text-emerald-400">{myStaff.role} • {myStaff.workStart} - {myStaff.workEnd}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs do Profissional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Agendamentos Hoje</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{todayApps.length}</span>
            <span className="text-[11px] font-medium text-amber-400">{pendingToday.length} pendentes</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Rendimento Concluído</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{formatBRL(completedEarnings)}</span>
            <p className="text-[11px] text-zinc-500 mt-1">{completedCount} atendimento{completedCount !== 1 ? 's' : ''} concluído{completedCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">A Confirmar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{formatBRL(confirmedEarnings)}</span>
            <p className="text-[11px] text-zinc-500 mt-1">Em atendimentos confirmados</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Geral</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{formatBRL(totalEarnings)}</span>
            <p className="text-[11px] text-zinc-500 mt-1">{cancelledCount} cancelado{cancelledCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Minha Agenda */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Minha Agenda ({myAppointments.length})
            </h2>
            <p className="text-xs text-zinc-400">Apenas os seus agendamentos</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | AppointmentStatus)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">Nenhum agendamento encontrado</p>
            <p className="text-xs text-zinc-500">Seus clientes agendam pela vitrine da empresa e seus horários aparecem aqui.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredApps.map(app => (
              <div key={app.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-center min-w-[76px]">
                    <span className="block text-sm font-extrabold text-white">{app.timeSlot}</span>
                    <span className="block text-[10px] text-zinc-500">{app.date.split('-').reverse().join('/')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{app.clientName}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-blue-400 mt-0.5">
                      <Scissors className="w-3 h-3 inline mr-1 -mt-0.5" />
                      {app.serviceName} • {formatBRL(app.servicePrice)} • {app.durationMinutes} min
                    </p>
                    {app.notes && <p className="text-[11px] text-zinc-500 mt-0.5"><StickyNote className="w-3 h-3 inline mr-1 -mt-0.5" />{app.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Confirmar
                    </button>
                  )}
                  {app.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Concluir
                    </button>
                  )}
                  {app.status !== 'cancelled' && app.status !== 'completed' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
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

      {/* Aviso de isolamento */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-zinc-400 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          Seu acesso é <strong className="text-emerald-300">isolado</strong>: você visualiza e gerencia apenas os agendamentos atribuídos a você, e os valores exibidos são somente dos seus atendimentos.
        </span>
      </div>
    </div>
  );
};
