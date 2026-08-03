import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Save, 
  Globe, 
  Check, 
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { selectedBusiness, updateBusinessInfo } = useApp();

  const [name, setName] = useState(selectedBusiness.name);
  const [description, setDescription] = useState(selectedBusiness.description);
  const [phone, setPhone] = useState(selectedBusiness.phone);
  const [whatsapp, setWhatsapp] = useState(selectedBusiness.whatsapp);
  const [address, setAddress] = useState(selectedBusiness.address);
  const [workingHours, setWorkingHours] = useState(selectedBusiness.workingHours);
  const [slotInterval, setSlotInterval] = useState(selectedBusiness.slotIntervalMinutes || 30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessInfo({
      name,
      description,
      phone,
      whatsapp,
      address,
      workingHours,
      slotIntervalMinutes: Number(slotInterval)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Preferências & Configurações do Negócio</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Ajuste informações de contato, horários e comportamento de agendamento
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Business Details */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Dados Principais da Empresa</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Nome Fantasia do Negócio</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Endereço Comercial</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-zinc-400 mb-1">Descrição / Apresentação da Vitrine</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
            />
          </div>
        </div>

        {/* Contact & WhatsApp */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Canais de Comunicação & WhatsApp</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Telefone Fixo / Comercial</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Número do WhatsApp (apenas números com DDD)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511988887777"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Slot Rules */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Horários de Funcionamento & Intervalos</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Descrição dos Horários</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="Ex: Segunda a Sábado, 08h às 20h"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Intervalo Padrão entre Encaixes</label>
              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-medium cursor-pointer"
              >
                <option value={15}>15 minutos (Encaixes curtos)</option>
                <option value={30}>30 minutos (Padrão barbearias / clínicas)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (Aulas / Personal trainer)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Preferências do Negócio</span>
        </button>
      </form>
    </div>
  );
};
