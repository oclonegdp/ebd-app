import React, { useState, useEffect } from 'react';
import { Scissors, Save, CheckCircle2, DollarSign, Check, Percent, Award, Info } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { StaffMember, Service } from '../../types';

interface StaffServicesProps {
  staffProfile: StaffMember;
  tenantId: string;
  onUpdated: () => void;
}

export const StaffServices: React.FC<StaffServicesProps> = ({
  staffProfile,
  tenantId,
  onUpdated,
}) => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(50);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const catalog = storageEngine.getServices(tenantId);
    setAllServices(catalog);

    // If staff profile has service_ids saved, use them.
    // If undefined or empty, default to selecting all services.
    if (staffProfile.service_ids && staffProfile.service_ids.length > 0) {
      setSelectedServiceIds(staffProfile.service_ids);
    } else {
      setSelectedServiceIds(catalog.map((s) => s.id));
    }

    setCommissionRate(staffProfile.commission_rate ?? 50);
  }, [staffProfile, tenantId]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    setSelectedServiceIds(allServices.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedServiceIds([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageEngine.saveStaffMember({
      ...staffProfile,
      service_ids: selectedServiceIds,
      commission_rate: Number(commissionRate),
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
            <Scissors className="w-5 h-5 text-yellow-500" />
            Meus Serviços Especializados & Comissão
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Selecione quais serviços do catálogo você realiza na barbearia e configure a sua porcentagem de comissão.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Serviços</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Seus serviços aptos e taxa de comissão foram salvos com sucesso!</span>
        </div>
      )}

      {/* Commission Rate Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-white">Taxa de Comissão do Profissional (%)</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Define a porcentagem do valor dos atendimentos direcionada a você para o cálculo do faturamento líquido.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-32">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono font-bold"
            />
            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs font-mono font-bold text-yellow-500">
            {commissionRate}%
          </span>
        </div>
      </div>

      {/* Services Selection Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">
            Catálogo de Serviços Disponíveis ({selectedServiceIds.length} de {allServices.length} selecionados)
          </h3>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-yellow-500 hover:underline cursor-pointer"
            >
              Marcar Todos
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Desmarcar Todos
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allServices.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            const myEarnings = (service.price * commissionRate) / 100;

            return (
              <div
                key={service.id}
                onClick={() => handleToggleService(service.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{service.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{service.description}</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-yellow-500 text-black'
                        : 'bg-slate-800 text-slate-600 border border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-300">
                    Valor: <strong className="text-white">R$ {service.price.toFixed(2)}</strong>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Sua comissão: R$ {myEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Serviços Aptos</span>
        </button>
      </div>
    </div>
  );
};
