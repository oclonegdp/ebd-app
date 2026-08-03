import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scissors, 
  User, 
  Calendar, 
  Clock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BookingModal: React.FC = () => {
  const { 
    bookingModal, 
    closeBookingModal, 
    selectedBusiness, 
    services, 
    staff, 
    appointments, 
    blockedSlots,
    addAppointment,
    currentUser
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [completedAppointment, setCompletedAppointment] = useState<any>(null);

  const businessServices = services.filter(s => s.businessId === selectedBusiness.id);
  const businessStaff = staff.filter(s => s.businessId === selectedBusiness.id);

  // Initialize preselected values when modal opens
  useEffect(() => {
    if (bookingModal.isOpen) {
      setStep(1);
      setSelectedServiceId(bookingModal.serviceId || businessServices[0]?.id || '');
      setSelectedStaffId(bookingModal.staffId || businessStaff[0]?.id || '');
      setSelectedDate(bookingModal.date || new Date().toISOString().split('T')[0]);
      setSelectedTimeSlot(bookingModal.timeSlot || '10:00');

      if (currentUser) {
        setClientName(currentUser.name);
        setClientEmail(currentUser.email);
        setClientPhone(currentUser.phone || '(11) 98888-7766');
      }
    }
  }, [bookingModal.isOpen]);

  if (!bookingModal.isOpen) return null;

  const currentServiceObj = businessServices.find(s => s.id === selectedServiceId) || businessServices[0];
  const currentStaffObj = businessStaff.find(s => s.id === selectedStaffId) || businessStaff[0];

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Generate available hours
  const hours = ['08:00', '09:00', '10:00', '10:30', '11:00', '13:00', '14:00', '15:00', '15:30', '16:00', '17:00', '18:00', '19:00'];

  // Helper to check if a slot is already taken, blocked, or in lunch break
  const isSlotTaken = (h: string) => {
    // 1. Check existing appointments
    const takenByAppointment = appointments.some(a => 
      a.businessId === selectedBusiness.id &&
      a.date === selectedDate &&
      a.timeSlot === h &&
      a.staffId === selectedStaffId &&
      a.status !== 'cancelled'
    );
    if (takenByAppointment) return true;

    // 2. Check blocked slots
    const takenByBlock = blockedSlots.some(b => 
      b.businessId === selectedBusiness.id &&
      b.date === selectedDate &&
      b.timeSlot.startsWith(h.split(':')[0]) &&
      (b.staffId === 'all' || b.staffId === selectedStaffId)
    );
    if (takenByBlock) return true;

    // 3. Check staff lunch break
    if (currentStaffObj && currentStaffObj.lunchStart && currentStaffObj.lunchEnd) {
      const hour = parseInt(h.split(':')[0], 10);
      const startHour = parseInt(currentStaffObj.lunchStart.split(':')[0], 10);
      const endHour = parseInt(currentStaffObj.lunchEnd.split(':')[0], 10);
      if (hour >= startHour && hour < endHour) {
        return true;
      }
    }

    return false;
  };

  const handleFinishBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const created = addAppointment({
      businessId: selectedBusiness.id,
      clientName,
      clientPhone,
      clientEmail,
      serviceId: currentServiceObj.id,
      serviceName: currentServiceObj.name,
      servicePrice: currentServiceObj.price,
      durationMinutes: currentServiceObj.durationMinutes,
      staffId: currentStaffObj ? currentStaffObj.id : 'stf_1',
      staffName: currentStaffObj ? currentStaffObj.name : 'Profissional Disponível',
      staffAvatar: currentStaffObj ? currentStaffObj.avatarUrl : '',
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'confirmed',
      notes
    });

    setCompletedAppointment(created);
    setStep(5); // Confirmation screen
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="p-5 bg-gradient-to-b from-zinc-800/80 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                Passo {step} de 5
              </span>
              <span className="text-xs text-zinc-400">{selectedBusiness.name}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              {step === 1 && '1. Escolha o Serviço'}
              {step === 2 && '2. Escolha o Profissional'}
              {step === 3 && '3. Data & Horário Desejado'}
              {step === 4 && '4. Seus Dados de Contato'}
              {step === 5 && 'Agendamento Confirmado! 🎉'}
            </h2>
          </div>

          <button
            onClick={closeBookingModal}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">Selecione o procedimento que deseja agendar:</p>
              <div className="space-y-2">
                {businessServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`
                      p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3
                      ${selectedServiceId === srv.id
                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}
                    `}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white">{srv.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{srv.description}</p>
                      <span className="inline-block text-[11px] font-medium text-blue-400 mt-1">
                        ⏱ {srv.durationMinutes} minutos
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {formatBRL(srv.price)}
                      </span>
                      {selectedServiceId === srv.id && (
                        <div className="w-5 h-5 ml-auto mt-1 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT PROFESSIONAL */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">Escolha o profissional de sua preferência:</p>
              <div className="space-y-2">
                {businessStaff.map((stf) => (
                  <div
                    key={stf.id}
                    onClick={() => setSelectedStaffId(stf.id)}
                    className={`
                      p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3
                      ${selectedStaffId === stf.id
                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={stf.avatarUrl} 
                        alt={stf.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{stf.name}</h3>
                        <p className="text-xs text-blue-400 font-medium">{stf.role}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">★ {stf.rating} • Horário: {stf.workStart} às {stf.workEnd}</p>
                      </div>
                    </div>

                    {selectedStaffId === stf.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME SLOT */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Selecione o Dia
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Hour Grid */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Horários Disponíveis ({selectedDate})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {hours.map((h) => {
                    const taken = isSlotTaken(h);
                    const isSelected = selectedTimeSlot === h;

                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={taken}
                        onClick={() => setSelectedTimeSlot(h)}
                        className={`
                          py-2 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1
                          ${taken 
                            ? 'bg-zinc-950/40 text-zinc-600 border border-zinc-800/50 cursor-not-allowed line-through' 
                            : isSelected 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400' 
                              : 'bg-zinc-950 text-zinc-200 border border-zinc-800 hover:border-zinc-700'}
                        `}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{h}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CLIENT DETAILS */}
          {step === 4 && (
            <form id="booking-form" onSubmit={handleFinishBooking} className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <p className="font-bold">Resumo da Reserva:</p>
                <p>• <strong>Serviço:</strong> {currentServiceObj?.name} ({formatBRL(currentServiceObj?.price || 0)})</p>
                <p>• <strong>Profissional:</strong> {currentStaffObj?.name}</p>
                <p>• <strong>Data & Horário:</strong> {selectedDate} às {selectedTimeSlot}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  WhatsApp / Celular com DDD
                </label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98888-7766"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Observações / Preferências (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prefiro degradê baixo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </form>
          )}

          {/* STEP 5: CONFIRMATION SUCCESS */}
          {step === 5 && completedAppointment && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Agendamento Realizado!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Guardamos seu horário em {selectedBusiness.name}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left text-xs text-zinc-300 space-y-2">
                <p>👤 <strong>Cliente:</strong> {completedAppointment.clientName}</p>
                <p>✂️ <strong>Serviço:</strong> {completedAppointment.serviceName}</p>
                <p>💈 <strong>Profissional:</strong> {completedAppointment.staffName}</p>
                <p>📅 <strong>Data:</strong> {completedAppointment.date} às {completedAppointment.timeSlot}</p>
                <p>💰 <strong>Valor Total:</strong> {formatBRL(completedAppointment.servicePrice)}</p>
              </div>

              <a
                href={`https://wa.me/${selectedBusiness.whatsapp}?text=Olá! Fiz o agendamento de ${completedAppointment.serviceName} para ${completedAppointment.date} às ${completedAppointment.timeSlot} pelo sistema EBD!`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Comprovante por WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition"
            >
              <span>Avançar para Profissional</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition"
            >
              <span>Avançar para Horário</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={() => setStep(4)}
              className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition"
            >
              <span>Avançar para Dados</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              form="booking-form"
              type="submit"
              className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
            >
              <span>Finalizar Agendamento</span>
              <Check className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={closeBookingModal}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
            >
              Fechar Janela
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
