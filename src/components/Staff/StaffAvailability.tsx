import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save, CheckCircle2, Copy, AlertCircle, Sun } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { StaffMember, BusinessHours } from '../../types';

interface StaffAvailabilityProps {
  staffProfile: StaffMember;
  onUpdated: () => void;
}

const DEFAULT_HOURS: BusinessHours[] = [
  { dayNum: 0, day: 'Domingo', isOpen: false, startTime: '09:00', endTime: '14:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 1, day: 'Segunda-feira', isOpen: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 2, day: 'Terça-feira', isOpen: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 3, day: 'Quarta-feira', isOpen: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 4, day: 'Quinta-feira', isOpen: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 5, day: 'Sexta-feira', isOpen: true, startTime: '08:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
  { dayNum: 6, day: 'Sábado', isOpen: true, startTime: '08:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' }
];

export const StaffAvailability: React.FC<StaffAvailabilityProps> = ({
  staffProfile,
  onUpdated,
}) => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (staffProfile.working_hours && staffProfile.working_hours.length === 7) {
      setHours(staffProfile.working_hours);
    } else {
      setHours(DEFAULT_HOURS);
    }
  }, [staffProfile]);

  const handleToggleDay = (dayNum: number) => {
    setHours((prev) =>
      prev.map((h) => (h.dayNum === dayNum ? { ...h, isOpen: !h.isOpen } : h))
    );
  };

  const handleChangeTime = (
    dayNum: number,
    field: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd',
    val: string
  ) => {
    setHours((prev) =>
      prev.map((h) => (h.dayNum === dayNum ? { ...h, [field]: val } : h))
    );
  };

  const handleCopyToAllOpen = (sourceDayNum: number) => {
    const source = hours.find((h) => h.dayNum === sourceDayNum);
    if (!source) return;

    setHours((prev) =>
      prev.map((h) =>
        h.isOpen
          ? {
              ...h,
              startTime: source.startTime,
              endTime: source.endTime,
              breakStart: source.breakStart,
              breakEnd: source.breakEnd,
            }
          : h
      )
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageEngine.saveStaffMember({
      ...staffProfile,
      working_hours: hours,
    });

    setSuccessMsg(true);
    onUpdated();
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Minha Disponibilidade & Horários de Atendimento
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure os dias em que atende e seus horários de turno/pausa. Essas regras refletem na vitrine de agendamento online.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Horários</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Sua agenda e horários de atendimento foram salvos com sucesso!</span>
        </div>
      )}

      {/* Hours List */}
      <div className="space-y-3">
        {hours.map((item) => (
          <div
            key={item.dayNum}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              item.isOpen
                ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Day & Toggle Switch */}
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleDay(item.dayNum)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                    item.isOpen ? 'bg-yellow-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform transform ${
                      item.isOpen ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <span className="text-xs font-bold text-white block">{item.day}</span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      item.isOpen ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {item.isOpen ? 'Disponível para Agendamento' : 'Dia de Folga / Fechado'}
                  </span>
                </div>
              </div>

              {/* Time Inputs */}
              {item.isOpen ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-xl">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Início Turno</label>
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => handleChangeTime(item.dayNum, 'startTime', e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Fim Turno</label>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => handleChangeTime(item.dayNum, 'endTime', e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Início Almoço</label>
                    <input
                      type="time"
                      value={item.breakStart}
                      onChange={(e) => handleChangeTime(item.dayNum, 'breakStart', e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Fim Almoço</label>
                    <input
                      type="time"
                      value={item.breakEnd}
                      onChange={(e) => handleChangeTime(item.dayNum, 'breakEnd', e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-right">
                  <span className="text-xs text-slate-500 font-mono italic">
                    Nenhum horário aberto neste dia
                  </span>
                </div>
              )}

              {/* Copy Action Button */}
              {item.isOpen && (
                <button
                  type="button"
                  onClick={() => handleCopyToAllOpen(item.dayNum)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer self-end md:self-center shrink-0"
                  title="Replicar estes horários para os outros dias de atendimento"
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Replicar Horários</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações de Horário</span>
        </button>
      </div>
    </div>
  );
};
