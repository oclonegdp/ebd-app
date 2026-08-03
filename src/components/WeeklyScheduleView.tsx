import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  User, 
  Scissors,
  Users,
  Lock,
  Unlock,
  Coffee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment, AppointmentStatus, BlockedSlot } from '../types';

export const WeeklyScheduleView: React.FC = () => {
  const { 
    selectedBusiness, 
    appointments, 
    staff, 
    blockedSlots,
    addBlockedSlot,
    deleteBlockedSlot,
    openBookingModal, 
    updateAppointmentStatus,
    deleteAppointment,
    currentUser
  } = useApp();

  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [quickBlockModal, setQuickBlockModal] = useState<{ isOpen: boolean; date: string; timeSlot: string } | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState<string>('Pausa / Intervalo Pessoal');

  // Filter appointments for selected business & role
  const isStaffRole = currentUser?.role === 'staff';
  const effectiveStaffFilter = isStaffRole && currentUser?.staffId ? currentUser.staffId : selectedStaffFilter;

  const rawBusinessAppointments = appointments.filter(a => a.businessId === selectedBusiness.id);
  const businessAppointments = effectiveStaffFilter !== 'all' 
    ? rawBusinessAppointments.filter(a => a.staffId === effectiveStaffFilter)
    : rawBusinessAppointments;

  const currentStaffList = isStaffRole && currentUser?.staffId
    ? staff.filter(s => s.businessId === selectedBusiness.id && s.id === currentUser.staffId)
    : staff.filter(s => s.businessId === selectedBusiness.id);

  // Generate 7 days of current week based on weekOffset
  const getWeekDays = () => {
    const curr = new Date();
    // Get Monday of current week
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMon + (weekOffset * 7));

    const days = [];
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      days.push({
        dateObj: d,
        isoDate: isoDate,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('pt-BR', { month: 'short' }),
        isToday: isoDate === new Date().toISOString().split('T')[0]
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Time slots from 08:00 to 19:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Helper to find appointments for specific date and hour slot
  const getAppointmentsForCell = (isoDate: string, timeSlot: string) => {
    return businessAppointments.filter(app => {
      const matchesDate = app.date === isoDate;
      // Match hour prefix e.g. "09:00" or "09:30"
      const matchesTime = app.timeSlot.startsWith(timeSlot.split(':')[0]);
      const matchesStaff = selectedStaffFilter === 'all' || app.staffId === selectedStaffFilter;
      return matchesDate && matchesTime && matchesStaff;
    });
  };

  // Helper to find blocked slots for specific date and hour slot
  const getBlockedSlotsForCell = (isoDate: string, timeSlot: string) => {
    return blockedSlots.filter(blk => {
      if (blk.businessId !== selectedBusiness.id) return false;
      const matchesDate = blk.date === isoDate;
      const matchesTime = blk.timeSlot.startsWith(timeSlot.split(':')[0]);
      const matchesStaff = selectedStaffFilter === 'all' || blk.staffId === 'all' || blk.staffId === selectedStaffFilter;
      return matchesDate && matchesTime && matchesStaff;
    });
  };

  // Helper to check if single filtered staff is on lunch break
  const getLunchBreakForCell = (timeSlot: string) => {
    if (selectedStaffFilter === 'all') return null;
    const targetStaff = currentStaffList.find(s => s.id === selectedStaffFilter);
    if (!targetStaff || !targetStaff.lunchStart || !targetStaff.lunchEnd) return null;

    const hour = parseInt(timeSlot.split(':')[0], 10);
    const startHour = parseInt(targetStaff.lunchStart.split(':')[0], 10);
    const endHour = parseInt(targetStaff.lunchEnd.split(':')[0], 10);

    if (hour >= startHour && hour < endHour) {
      return `${targetStaff.lunchStart} às ${targetStaff.lunchEnd}`;
    }
    return null;
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30';
      case 'completed':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30';
      case 'cancelled':
        return 'bg-rose-500/20 border-rose-500/40 text-rose-300 opacity-60 hover:opacity-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <span>Grade Semanal de Horários</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Controle de disponibilidade, agendamentos e encaixes
          </p>
        </div>

        {/* Filters & Week Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Profissionais</option>
              {currentStaffList.map(stf => (
                <option key={stf.id} value={stf.id}>
                  {stf.name}
                </option>
              ))}
            </select>
          </div>

          {/* Week Prev/Next Controls */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Semana Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Hoje
            </button>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Próxima Semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openBookingModal()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Encaixe</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid Calendar Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            {/* Table Header: Days of the week */}
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80">
                <th className="p-3 text-center text-xs font-semibold text-zinc-500 w-20 border-r border-zinc-800">
                  Horário
                </th>
                {weekDays.map(day => (
                  <th 
                    key={day.isoDate} 
                    className={`p-3 text-center border-r border-zinc-800/80 last:border-r-0 ${
                      day.isToday ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {day.dayName}
                    </div>
                    <div className={`text-sm font-black mt-0.5 ${
                      day.isToday ? 'text-blue-400' : 'text-zinc-200'
                    }`}>
                      {day.dayNumber} {day.monthName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Time Rows */}
            <tbody className="divide-y divide-zinc-800/60">
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot} className="hover:bg-zinc-950/30 transition">
                  {/* Time label column */}
                  <td className="p-2 text-center text-xs font-mono font-bold text-zinc-400 bg-zinc-950/40 border-r border-zinc-800 align-top">
                    {timeSlot}
                  </td>

                  {/* Day Columns for this time slot */}
                  {weekDays.map(day => {
                    const cellApps = getAppointmentsForCell(day.isoDate, timeSlot);
                    const cellBlocks = getBlockedSlotsForCell(day.isoDate, timeSlot);
                    const lunchInfo = getLunchBreakForCell(timeSlot);

                    return (
                      <td 
                        key={day.isoDate}
                        className={`p-1.5 border-r border-zinc-800/60 last:border-r-0 align-top h-24 transition relative ${
                          day.isToday ? 'bg-blue-600/[0.02]' : ''
                        } ${lunchInfo ? 'bg-amber-950/10' : ''}`}
                      >
                        {/* Cell Content: Appointments, Blocked Slots, or Lunch */}
                        {cellApps.length > 0 ? (
                          <div className="space-y-1.5 h-full overflow-y-auto">
                            {cellApps.map(app => (
                              <div
                                key={app.id}
                                onClick={() => setSelectedAppointment(app)}
                                className={`p-2 rounded-lg border text-left cursor-pointer transition shadow-sm ${getStatusColor(app.status)}`}
                              >
                                <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                                  <span className="truncate">{app.clientName}</span>
                                  <span className="font-mono text-[10px]">{app.timeSlot}</span>
                                </div>
                                <div className="text-[10px] opacity-90 truncate mt-0.5 font-medium">
                                  {app.serviceName}
                                </div>
                                <div className="text-[9px] opacity-75 mt-0.5 truncate">
                                  {app.staffName}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : cellBlocks.length > 0 ? (
                          <div className="space-y-1.5 h-full overflow-y-auto">
                            {cellBlocks.map(blk => (
                              <div
                                key={blk.id}
                                className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-left relative group/blk"
                              >
                                <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                                  <span className="flex items-center gap-1 text-rose-300">
                                    <Lock className="w-3 h-3 text-rose-400" />
                                    <span>Bloqueado</span>
                                  </span>
                                  <button
                                    onClick={() => deleteBlockedSlot(blk.id)}
                                    title="Desbloquear horário"
                                    className="opacity-0 group-hover/blk:opacity-100 p-0.5 text-rose-400 hover:text-white transition"
                                  >
                                    <Unlock className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[10px] text-rose-200 font-medium truncate mt-0.5">
                                  {blk.reason}
                                </div>
                                <div className="text-[9px] text-rose-400/80 truncate mt-0.5">
                                  {blk.staffName}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : lunchInfo ? (
                          <div className="h-full flex flex-col items-center justify-center p-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center">
                            <Coffee className="w-4 h-4 text-amber-400 mb-0.5" />
                            <span className="text-[10px] font-bold">Horário de Almoço</span>
                            <span className="text-[9px] text-amber-400/80 font-mono">{lunchInfo}</span>
                          </div>
                        ) : (
                          /* Empty Slot Trigger with Dual Options */
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                            <button
                              onClick={() => openBookingModal({ date: day.isoDate, timeSlot: timeSlot, staffId: selectedStaffFilter !== 'all' ? selectedStaffFilter : undefined })}
                              className="w-full py-1 px-2 rounded-md bg-zinc-950/50 hover:bg-blue-600/20 border border-dashed border-zinc-800 hover:border-blue-500/50 text-zinc-500 hover:text-blue-300 text-[10px] font-semibold transition flex items-center justify-center gap-1"
                              title="Agendar Cliente neste Horário"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Agendar</span>
                            </button>
                            <button
                              onClick={() => setQuickBlockModal({ isOpen: true, date: day.isoDate, timeSlot: timeSlot })}
                              className="w-full py-1 px-2 rounded-md bg-zinc-950/50 hover:bg-rose-600/20 border border-dashed border-zinc-800 hover:border-rose-500/50 text-zinc-500 hover:text-rose-300 text-[10px] font-semibold transition flex items-center justify-center gap-1"
                              title="Bloquear este horário direto"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Bloquear</span>
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Details for Clicked Appointment */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-bold text-white text-sm">{selectedAppointment.clientName}</p>
                  <p className="text-zinc-400">{selectedAppointment.clientPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase">Serviço</p>
                  <p className="font-semibold text-zinc-200 mt-0.5">{selectedAppointment.serviceName}</p>
                  <p className="text-emerald-400 font-bold">{formatBRL(selectedAppointment.servicePrice)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase">Data & Horário</p>
                  <p className="font-semibold text-zinc-200 mt-0.5">{selectedAppointment.date}</p>
                  <p className="text-blue-400 font-bold">{selectedAppointment.timeSlot} ({selectedAppointment.durationMinutes} min)</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase">Profissional Responsável</p>
                <p className="font-semibold text-zinc-200 mt-0.5">{selectedAppointment.staffName}</p>
              </div>

              {selectedAppointment.notes && (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase">Observações</p>
                  <p className="text-zinc-300 mt-0.5">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, 'confirmed');
                    setSelectedAppointment(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, 'completed');
                    setSelectedAppointment(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                >
                  Concluir
                </button>
              </div>

              <button
                onClick={() => {
                  deleteAppointment(selectedAppointment.id);
                  setSelectedAppointment(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Block Modal */}
      {quickBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Bloquear Horário na Agenda</span>
              </h3>
              <button
                onClick={() => setQuickBlockModal(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <p className="text-zinc-400">Data e Horário Selecionado:</p>
                <p className="text-sm font-bold text-white font-mono">{quickBlockModal.date} às {quickBlockModal.timeSlot}</p>
                <p className="text-[11px] text-zinc-400">
                  Profissional: {selectedStaffFilter === 'all' ? 'Toda a Equipe' : currentStaffList.find(s => s.id === selectedStaffFilter)?.name}
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Motivo do Bloqueio</label>
                <input
                  type="text"
                  required
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="Ex: Pausa para almoço, Treinamento, Médico..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setQuickBlockModal(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    addBlockedSlot({
                      businessId: selectedBusiness.id,
                      staffId: selectedStaffFilter === 'all' ? 'all' : selectedStaffFilter,
                      staffName: selectedStaffFilter === 'all' ? 'Toda a Equipe' : currentStaffList.find(s => s.id === selectedStaffFilter)?.name || 'Profissional',
                      date: quickBlockModal.date,
                      timeSlot: quickBlockModal.timeSlot,
                      reason: blockReasonInput || 'Bloqueio de Agenda'
                    });
                    setQuickBlockModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirmar Bloqueio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
