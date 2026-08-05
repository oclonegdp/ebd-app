import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, DollarSign, Check, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { Appointment, Service, StaffMember } from '../../types';

interface AppointmentEditModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const AppointmentEditModal: React.FC<AppointmentEditModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<'confirmed' | 'completed' | 'cancelled'>('confirmed');
  const [staffId, setStaffId] = useState('');
  const [serviceId, setServiceId] = useState('');

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (appointment) {
      setCustomerName(appointment.customer_name || '');
      setCustomerPhone(appointment.customer_phone || '');
      setDate(appointment.date || '');
      setStartTime(appointment.start_time || '');
      setPrice(appointment.price || 0);
      setStatus(appointment.status || 'confirmed');
      setStaffId(appointment.staff_id || '');
      setServiceId(appointment.service_id || '');

      // Load staff & services for dropdown
      if (appointment.tenant_id) {
        setStaffList(storageEngine.getStaff(appointment.tenant_id));
        setServicesList(storageEngine.getServices(appointment.tenant_id));
      }
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStatus = (appointment.status === 'cancelled' && status === 'completed') ? 'cancelled' : status;
    try {
      await storageEngine.updateAppointment(appointment.id, {
        customer_name: customerName,
        customer_phone: customerPhone,
        date,
        start_time: startTime,
        price: Number(price),
        status: finalStatus,
        staff_id: staffId,
        service_id: serviceId,
      });
    } catch (error: any) {
      alert(error.message || 'Não foi possível salvar o agendamento.');
      return;
    }

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onUpdated();
      onClose();
    }, 1000);
  };

  const handleDelete = async () => {
    try {
      await storageEngine.deleteAppointment(appointment.id);
    } catch (error: any) {
      alert(error.message || 'Não foi possível excluir o agendamento.');
      return;
    }
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#16191F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Editar / Gerenciar Agendamento</h2>
              <p className="text-xs text-slate-400">Altere horários, cliente, barbeiro ou cancele a reserva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isDeleting ? (
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Status do Agendamento</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('confirmed')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    status === 'confirmed'
                      ? 'bg-yellow-500 text-black border-yellow-400 font-extrabold shadow-md'
                      : 'bg-[#0F1115] text-slate-400 border-slate-800'
                  }`}
                >
                  Confirmado
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md'
                      : 'bg-[#0F1115] text-slate-400 border-slate-800'
                  }`}
                >
                  Concluído
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('cancelled')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    status === 'cancelled'
                      ? 'bg-red-500 text-white border-red-400 font-extrabold shadow-md'
                      : 'bg-[#0F1115] text-slate-400 border-slate-800'
                  }`}
                >
                  Cancelado
                </button>
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-yellow-500" />
                <span>Nome do Cliente</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-yellow-500" />
                <span>Telefone / WhatsApp</span>
              </label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Data</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Horário</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
            </div>

            {/* Staff & Service */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Profissional / Barbeiro</label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Serviço</label>
                <select
                  value={serviceId}
                  onChange={(e) => {
                    const srv = servicesList.find((s) => s.id === e.target.value);
                    setServiceId(e.target.value);
                    if (srv) setPrice(srv.price);
                  }}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  {servicesList.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} (R$ {srv.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-yellow-500" />
                <span>Valor Final (R$)</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
            </div>

            {successMsg && (
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>Agendamento atualizado com sucesso!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Excluir Agendamento</h3>
                <p className="text-xs text-slate-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Deseja remover permanentemente o agendamento do cliente <strong>{appointment.customer_name}</strong> marcado para <strong>{appointment.date} às {appointment.start_time}</strong>?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleting(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-md shadow-red-500/20 transition cursor-pointer"
              >
                Sim, Excluir Registro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
