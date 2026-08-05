import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Search, Filter, X, Edit } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { Appointment } from '../../types';
import { ListSkeleton } from '../UI/LoadingSkeleton';
import { AppointmentEditModal } from './AppointmentEditModal';

export const WeeklySchedule: React.FC = () => {
  const { currentTenant } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const loadAppointments = () => {
    if (currentTenant) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setAppointments(storageEngine.getAppointments(currentTenant.id));
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    loadAppointments();

    const handleSync = () => {
      if (currentTenant) {
        setAppointments(storageEngine.getAppointments(currentTenant.id));
      }
    };

    window.addEventListener('ebd_storage_synced', handleSync);
    return () => {
      window.removeEventListener('ebd_storage_synced', handleSync);
    };
  }, [currentTenant]);

  const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled') => {
    const apt = appointments.find((a) => a.id === id);
    if (apt?.status === 'cancelled' && status === 'completed') return;
    try {
      await storageEngine.updateAppointmentStatus(id, status);
      if (currentTenant) {
        setAppointments(storageEngine.getAppointments(currentTenant.id));
      }
    } catch (error: any) {
      alert(error.message || 'Não foi possível atualizar o agendamento.');
    }
  };

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
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            Grade Semanal de Agendamentos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os horários agendados e atualize o status dos atendimentos da loja em tempo real.
          </p>
        </div>
      </div>

      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        {/* Controls bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Listagem de Horários</span>
              {filteredAppointments.length !== appointments.length && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  {filteredAppointments.length} de {appointments.length}
                </span>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente ou telefone..."
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
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0F1115] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
            />

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
              <div className="py-12 text-center space-y-2">
                <Filter className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Nenhum agendamento encontrado com os filtros informados.</p>
                {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-yellow-500 underline font-semibold cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-800/30 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{apt.customer_name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {apt.customer_phone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Horário: <span className="text-yellow-500 font-mono font-bold">{apt.date} às {apt.start_time}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-white font-mono">R$ {apt.price?.toFixed(2)}</span>

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

                    {apt.status === 'confirmed' && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          title="Concluir atendimento"
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3 h-3" /> Concluir
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                          title="Cancelar atendimento"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-[10px] border border-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsAptModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 transition cursor-pointer active:scale-95"
                      title="Editar Agendamento"
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

      <AppointmentEditModal
        appointment={selectedAppointment}
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        onUpdated={loadAppointments}
      />
    </div>
  );
};
