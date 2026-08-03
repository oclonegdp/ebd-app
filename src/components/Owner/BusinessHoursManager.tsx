import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Save, CheckCircle2 } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { BusinessHours } from '../../types';

export const BusinessHoursManager: React.FC = () => {
  const { currentTenant } = useAuth();
  const [schedule, setSchedule] = useState<BusinessHours[]>(() => storageEngine.getBusinessHours(currentTenant?.id));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleDay = (idx: number) => {
    const updated = [...schedule];
    updated[idx].isOpen = !updated[idx].isOpen;
    setSchedule(updated);
  };

  const handleTimeChange = (idx: number, field: keyof BusinessHours, value: string) => {
    const updated = [...schedule];
    (updated[idx] as any)[field] = value;
    setSchedule(updated);
  };

  const handleSaveAll = () => {
    storageEngine.saveBusinessHours(schedule, currentTenant?.id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Gestão de Expediente & Horários da Loja
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure os dias e horários de funcionamento para sincronizar com os slots da Vitrine.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Horários de Atendimento</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Configurações de expediente salvas com sucesso para {currentTenant?.name}!
        </div>
      )}

      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        {schedule.map((item, idx) => (
          <div
            key={item.dayNum}
            className="p-4 bg-slate-800/30 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={item.isOpen}
                onChange={() => handleToggleDay(idx)}
                className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 accent-yellow-500 cursor-pointer"
              />
              <div>
                <h4 className="text-xs font-bold text-white">{item.day}</h4>
                <p className="text-[10px] text-slate-400">
                  {item.isOpen ? 'Aberto para agendamento' : 'Fechado (Sem atendimentos)'}
                </p>
              </div>
            </div>

            {item.isOpen && (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Abertura:</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                    className="bg-[#0F1115] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Fechamento:</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                    className="bg-[#0F1115] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <span className="text-slate-400">Pausa Almoço:</span>
                  <input
                    type="time"
                    value={item.breakStart}
                    onChange={(e) => handleTimeChange(idx, 'breakStart', e.target.value)}
                    className="bg-[#0F1115] border border-slate-700 rounded-lg px-1.5 py-1 text-white font-mono text-xs"
                  />
                  <span className="text-slate-500">até</span>
                  <input
                    type="time"
                    value={item.breakEnd}
                    onChange={(e) => handleTimeChange(idx, 'breakEnd', e.target.value)}
                    className="bg-[#0F1115] border border-slate-700 rounded-lg px-1.5 py-1 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
