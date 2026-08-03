import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Lock, 
  Unlock, 
  Check, 
  Save, 
  User, 
  Coffee, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sliders, 
  CalendarDays,
  Sparkles,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffMember } from '../types';

export const WorkScheduleManagementView: React.FC = () => {
  const { 
    selectedBusiness, 
    staff, 
    blockedSlots, 
    addBlockedSlot, 
    deleteBlockedSlot, 
    updateStaffSchedule 
  } = useApp();

  const currentStaffList = staff.filter(s => s.businessId === selectedBusiness.id);

  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'block' | 'summary'>('schedule');

  // Schedule editing state
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentStaffList[0]?.id || '');
  const selectedStaffObj = currentStaffList.find(s => s.id === selectedStaffId) || currentStaffList[0];

  const allWeekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const [selectedDays, setSelectedDays] = useState<string[]>(selectedStaffObj?.availableDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
  const [workStart, setWorkStart] = useState<string>(selectedStaffObj?.workStart || '09:00');
  const [workEnd, setWorkEnd] = useState<string>(selectedStaffObj?.workEnd || '19:00');
  const [hasLunchBreak, setHasLunchBreak] = useState<boolean>(!!selectedStaffObj?.lunchStart);
  const [lunchStart, setLunchStart] = useState<string>(selectedStaffObj?.lunchStart || '12:00');
  const [lunchEnd, setLunchEnd] = useState<string>(selectedStaffObj?.lunchEnd || '13:00');

  // When selected staff changes, load their data
  const handleSelectStaff = (id: string) => {
    setSelectedStaffId(id);
    const target = currentStaffList.find(s => s.id === id);
    if (target) {
      setSelectedDays(target.availableDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
      setWorkStart(target.workStart || '09:00');
      setWorkEnd(target.workEnd || '19:00');
      setHasLunchBreak(!!target.lunchStart);
      setLunchStart(target.lunchStart || '12:00');
      setLunchEnd(target.lunchEnd || '13:00');
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffObj) return;

    updateStaffSchedule(selectedStaffObj.id, {
      availableDays: selectedDays,
      workStart,
      workEnd,
      lunchStart: hasLunchBreak ? lunchStart : undefined,
      lunchEnd: hasLunchBreak ? lunchEnd : undefined
    });
  };

  // Direct Time Block Form State
  const [blockStaffId, setBlockStaffId] = useState<string>(currentStaffList[0]?.id || 'all');
  const [blockDate, setBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [blockTimeSlot, setBlockTimeSlot] = useState<string>('14:00');
  const [blockReason, setBlockReason] = useState<string>('Intervalo / Pausa Pessoal');

  const availableHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const stfName = blockStaffId === 'all' 
      ? 'Toda a Equipe' 
      : currentStaffList.find(s => s.id === blockStaffId)?.name || 'Profissional';

    addBlockedSlot({
      businessId: selectedBusiness.id,
      staffId: blockStaffId,
      staffName: stfName,
      date: blockDate,
      timeSlot: blockTimeSlot,
      reason: blockReason || 'Bloqueio Manual de Agenda'
    });
  };

  // Filter blocked slots for current business
  const currentBusinessBlockedSlots = blockedSlots.filter(b => b.businessId === selectedBusiness.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Gestão de Expediente & Pausas</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Defina horários de trabalho, intervalos de almoço e bloqueie horários livres na agenda
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Expediente & Almoço</span>
          </button>
          <button
            onClick={() => setActiveSubTab('block')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'block'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear Agenda</span>
          </button>
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Resumo da Equipe</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: WORK SCHEDULE & LUNCH BREAKS */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-6">
          {/* Professional Selector Header */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Selecione o Profissional</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Escolha quem você deseja ajustar os horários de expediente e almoço
                </p>
              </div>

              {/* Staff Select Dropdown */}
              <select
                value={selectedStaffId}
                onChange={(e) => handleSelectStaff(e.target.value)}
                className="bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[220px]"
              >
                {currentStaffList.map(stf => (
                  <option key={stf.id} value={stf.id}>
                    {stf.name} ({stf.role})
                  </option>
                ))}
              </select>
            </div>

            {selectedStaffObj && (
              <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <img 
                  src={selectedStaffObj.avatarUrl} 
                  alt={selectedStaffObj.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <p className="text-sm font-bold text-white">{selectedStaffObj.name}</p>
                  <p className="text-xs text-blue-400 font-medium">{selectedStaffObj.role}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Expediente atual: {selectedStaffObj.workStart} às {selectedStaffObj.workEnd} 
                    {selectedStaffObj.lunchStart ? ` • Intervalo: ${selectedStaffObj.lunchStart} às ${selectedStaffObj.lunchEnd}` : ' • Sem almoço cadastrado'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Form */}
          {selectedStaffObj && (
            <form onSubmit={handleSaveSchedule} className="space-y-6">
              {/* Working Days Selector */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  <span>Dias da Semana em que Atende</span>
                </h3>

                <p className="text-xs text-zinc-400">
                  Clique para marcar ou desmarcar os dias de funcionamento deste profissional:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {allWeekDays.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`
                          py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border
                          ${isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                        `}
                      >
                        <span className="uppercase text-[10px] tracking-wider">{day}</span>
                        <span className="text-xs">
                          {isSelected ? '✓ Trabalha' : 'Folga'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours & Lunch Break Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Working Hours */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Horário de Entrada & Saída</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Início do Turno</label>
                      <input
                        type="time"
                        value={workStart}
                        onChange={(e) => setWorkStart(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Término do Turno</label>
                      <input
                        type="time"
                        value={workEnd}
                        onChange={(e) => setWorkEnd(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Lunch Break Settings */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span>Intervalo de Almoço / Pausa</span>
                    </h3>

                    {/* Toggle Lunch Break */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasLunchBreak}
                        onChange={(e) => setHasLunchBreak(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {hasLunchBreak ? (
                    <div className="grid grid-cols-2 gap-4 text-xs animate-fade-in">
                      <div>
                        <label className="block text-zinc-400 mb-1">Início do Almoço</label>
                        <input
                          type="time"
                          value={lunchStart}
                          onChange={(e) => setLunchStart(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1">Retorno do Almoço</label>
                        <input
                          type="time"
                          value={lunchEnd}
                          onChange={(e) => setLunchEnd(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic py-2">
                      Sem pausa de almoço definida. O profissional estará disponível direto durante todo o turno.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração de Expediente de {selectedStaffObj.name}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUB TAB 2: DIRECT TIME BLOCKS */}
      {activeSubTab === 'block' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to Block Time Slot */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Bloquear Horário Direto</span>
            </h2>

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Profissional Afetado</label>
                <select
                  value={blockStaffId}
                  onChange={(e) => setBlockStaffId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
                >
                  <option value="all">Toda a Equipe (Bloqueio Geral)</option>
                  {currentStaffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Data do Bloqueio</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Horário a Bloquear</label>
                <select
                  value={blockTimeSlot}
                  onChange={(e) => setBlockTimeSlot(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono font-bold"
                >
                  {availableHours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Motivo do Bloqueio / Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pausa para médico, Treinamento, Folga..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                <Lock className="w-4 h-4" />
                <span>Efetuar Bloqueio de Agenda</span>
              </button>
            </form>
          </div>

          {/* List of Active Blocked Slots */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Horários Bloqueados Ativos ({currentBusinessBlockedSlots.length})</span>
              </h2>
            </div>

            {currentBusinessBlockedSlots.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs font-semibold text-zinc-300">Nenhum bloqueio registrado no momento</p>
                <p className="text-[11px] text-zinc-500">Todos os horários livres estão disponíveis para agendamento.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {currentBusinessBlockedSlots.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/30 flex items-center justify-between gap-3 hover:border-rose-500/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{block.staffName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {block.date} às {block.timeSlot}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{block.reason}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteBlockedSlot(block.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 text-xs font-medium border border-zinc-800 hover:border-rose-500/40 transition flex items-center gap-1 shrink-0"
                      title="Desbloquear e liberar na agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desbloquear</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 3: TEAM SCHEDULE OVERVIEW */}
      {activeSubTab === 'summary' && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Resumo de Expediente de Toda a Equipe</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentStaffList.map((stf) => (
              <div 
                key={stf.id}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={stf.avatarUrl} 
                    alt={stf.name} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{stf.name}</h3>
                    <p className="text-xs text-blue-400">{stf.role}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Expediente:</span>
                    <span className="font-mono font-bold text-zinc-200">{stf.workStart} - {stf.workEnd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Almoço:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {stf.lunchStart ? `${stf.lunchStart} - ${stf.lunchEnd}` : 'Sem almoço'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Dias de Trabalho:</span>
                    <span className="font-semibold text-emerald-400">
                      {stf.availableDays?.join(', ') || 'Seg a Sáb'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
