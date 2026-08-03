import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Calendar, Award, Check, AlertTriangle, Lock, Clock } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { Tenant } from '../../types';

interface TenantLicenseModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const TenantLicenseModal: React.FC<TenantLicenseModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [plan, setPlan] = useState<'trial' | 'pro' | 'enterprise'>('pro');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [maxStaff, setMaxStaff] = useState<number>(10);

  const [successMsg, setSuccessMsg] = useState(false);

  const [customDaysInput, setCustomDaysInput] = useState<string>('30');

  useEffect(() => {
    if (tenant) {
      setPlan(tenant.plan || 'pro');
      const defaultExp = tenant.license_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setExpiresAt(defaultExp);
      setActive(tenant.active ?? true);
      setMaxStaff(tenant.max_staff || 10);

      // Initialize custom days calculation
      const expDate = new Date(defaultExp);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      setCustomDaysInput(diffDays > 0 ? diffDays.toString() : '30');
    }
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleAddDays = (days: number) => {
    const current = expiresAt ? new Date(expiresAt) : new Date();
    // If date is invalid or past, start from today
    const baseDate = isNaN(current.getTime()) || current < new Date() ? new Date() : current;
    baseDate.setDate(baseDate.getDate() + days);
    const newDateStr = baseDate.toISOString().split('T')[0];
    setExpiresAt(newDateStr);

    // Update custom days remaining
    const today = new Date();
    const newDiff = Math.ceil((baseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setCustomDaysInput(newDiff > 0 ? newDiff.toString() : '0');
  };

  const handleSetDaysFromToday = (daysNum: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysNum);
    setExpiresAt(targetDate.toISOString().split('T')[0]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageEngine.updateTenant(tenant.id, {
      plan,
      license_expires_at: expiresAt,
      active,
      max_staff: maxStaff,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onUpdated();
      onClose();
    }, 1000);
  };

  // Calculate days remaining
  const expDate = expiresAt ? new Date(expiresAt) : new Date();
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#16191F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Licenciamento & Validade</h2>
              <p className="text-xs text-slate-400">Gerenciar plano e prazo de acesso da unidade: {tenant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Custom Editable Days Control */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span>Definir / Estender Validade por Quantidade de Dias</span>
              </label>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  diffDays < 0
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {diffDays < 0 ? `Expirado há ${Math.abs(diffDays)} dia(s)` : `${diffDays} dia(s) restante(s)`}
              </span>
            </div>

            {/* Custom Input Field */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  placeholder="Ex: 7, 15, 45, 120..."
                  value={customDaysInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomDaysInput(val);
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleSetDaysFromToday(parsed);
                    }
                  }}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-3 pr-12 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                  DIAS
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(customDaysInput, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleSetDaysFromToday(parsed);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs transition active:scale-95 cursor-pointer whitespace-nowrap shadow-sm"
                >
                  Definir da Data de Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(customDaysInput, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleAddDays(parsed);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 font-bold text-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  + Adicionar Dias
                </button>
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="pt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Atalhos rápidos:</span>
              {[7, 15, 30, 60, 90, 180, 365].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setCustomDaysInput(d.toString());
                    handleSetDaysFromToday(d);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-yellow-400 text-slate-300 text-[10px] font-bold border border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  +{d}d
                </button>
              ))}
            </div>
          </div>

          {/* Plan Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Plano de Assinatura</label>
            <div className="grid grid-cols-3 gap-2">
              {(['trial', 'pro', 'enterprise'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wider border transition cursor-pointer ${
                    plan === p
                      ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                      : 'bg-[#0F1115] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Expiration Date Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-yellow-500" />
              <span>Data de Vencimento da Licença</span>
            </label>
            <input
              type="date"
              required
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Max Staff Limit */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Limite Máximo de Barbeiros / Staff</label>
            <input
              type="number"
              min={1}
              value={maxStaff}
              onChange={(e) => setMaxStaff(Number(e.target.value))}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Active Status Switch */}
          <div className="p-3.5 rounded-xl bg-[#0F1115] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Status de Acesso da Unidade</p>
              <p className="text-[10px] text-slate-400">Bloqueia instantaneamente o acesso do dono e clientes</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              {active ? 'Ativa / Liberada' : 'Bloqueada / Suspensa'}
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Licença e status atualizados com sucesso!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
            >
              Salvar Licença
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
