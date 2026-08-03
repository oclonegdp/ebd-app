import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Scissors, Calendar, Clock, MapPin, MessageSquare, CheckCircle2, User, X, Copy, Check, Link as LinkIcon, Store, Search, Filter, AlertCircle, Crown } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { supabaseEngine } from '../../lib/supabaseEngine';
import { getStorePublicUrl } from '../../lib/urlUtils';
import { Service, StaffMember, Appointment } from '../../types';
import { BannerSkeleton, CardSkeleton, ListSkeleton } from '../UI/LoadingSkeleton';
import { computeTenantGamification } from '../Staff/StaffGamification';

export const PublicVitrine: React.FC = () => {
  const { currentTenant, isIsolatedVitrine, urlSlugError, allTenants, switchTenant } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search state
  const [searchServiceQuery, setSearchServiceQuery] = useState('');
  const [searchStaffQuery, setSearchStaffQuery] = useState('');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'local' | 'online_simulated'>('local');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableSlots = [
    '09:00', '09:45', '10:30', '11:15', '13:00',
    '13:45', '14:30', '15:15', '16:00', '16:45',
    '17:30', '18:15', '19:00', '19:45'
  ];

  useEffect(() => {
    if (currentTenant) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setServices(storageEngine.getServices(currentTenant.id));
        setStaffMembers(storageEngine.getStaff(currentTenant.id));
        setAppointments(storageEngine.getAppointments(currentTenant.id));
        setIsLoading(false);
      }, 350);

      const handleSync = () => {
        setServices(storageEngine.getServices(currentTenant.id));
        setStaffMembers(storageEngine.getStaff(currentTenant.id));
        setAppointments(storageEngine.getAppointments(currentTenant.id));
      };

      window.addEventListener('ebd_storage_synced', handleSync);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('ebd_storage_synced', handleSync);
      };
    }
  }, [currentTenant]);

  const topBarberId = React.useMemo(() => {
    if (!currentTenant) return null;
    const gamified = computeTenantGamification(currentTenant.id);
    const sorted = [...gamified].sort((a, b) => b.weeklyXP - a.weeklyXP);
    if (sorted.length > 0 && sorted[0].weeklyXP > 0) {
      return sorted[0].staff.id;
    }
    return null;
  }, [currentTenant, appointments]);

  const filteredServices = services.filter((srv) =>
    srv.name.toLowerCase().includes(searchServiceQuery.toLowerCase()) ||
    srv.description.toLowerCase().includes(searchServiceQuery.toLowerCase())
  );

  const filteredStaff = staffMembers.filter((st) =>
    st.name.toLowerCase().includes(searchStaffQuery.toLowerCase()) ||
    st.specialties.some((sp) => sp.toLowerCase().includes(searchStaffQuery.toLowerCase()))
  );

  const handleStartBooking = (service?: Service, staff?: StaffMember) => {
    if (service) setSelectedService(service);
    else if (services.length > 0) setSelectedService(services[0]);

    if (staff) setSelectedStaff(staff);
    else if (staffMembers.length > 0) setSelectedStaff(staffMembers[0]);

    setIsSuccess(false);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !selectedService || !selectedStaff) return;

    const newAppointment = storageEngine.createAppointment({
      tenant_id: currentTenant.id,
      service_id: selectedService.id,
      staff_id: selectedStaff.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      date: selectedDate,
      start_time: selectedSlot,
      end_time: `${parseInt(selectedSlot.split(':')[0]) + 1}:00`,
      price: selectedService.price,
      status: 'confirmed',
      payment_method: paymentMethod,
    });

    // Directly guarantee write to Supabase table
    await supabaseEngine.upsertAppointment(newAppointment);

    // Notify other components (Owner schedule, etc) in real time
    window.dispatchEvent(new CustomEvent('ebd_storage_synced'));

    setIsSuccess(true);
    setAppointments(storageEngine.getAppointments(currentTenant.id));

    setTimeout(() => {
      setIsBookingModalOpen(false);
      setIsSuccess(false);
      setCustomerName('');
      setCustomerPhone('');
    }, 2000);
  };

  const handleCancelAppointment = async (id: string) => {
    storageEngine.updateAppointmentStatus(id, 'cancelled');
    window.dispatchEvent(new CustomEvent('ebd_storage_synced'));
    if (currentTenant) {
      setAppointments(storageEngine.getAppointments(currentTenant.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* URL Slug Error Notification */}
      {urlSlugError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">{urlSlugError}</p>
              <p className="text-[11px] text-slate-400">
                Selecione abaixo uma das unidades ativas disponíveis para continuar navegando.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allTenants.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTenant(t.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-yellow-500 border border-slate-700 transition cursor-pointer"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Store Header Banner */}
      {isLoading ? (
        <BannerSkeleton />
      ) : (
        <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left z-10">
            <img
              src={currentTenant?.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80'}
              alt={currentTenant?.name}
              className="w-24 h-24 rounded-xl object-cover border-2 border-yellow-500 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  Barbearia & Estúdio Profissional
                </span>
                {isIsolatedVitrine && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Store className="w-3 h-3" /> Vitrine Oficial Isolada
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black text-white mt-1.5">{currentTenant?.name || 'EBD BarberShop'}</h1>
              <p className="text-xs text-slate-400 max-w-lg mt-1 leading-relaxed">
                {currentTenant?.description ||
                  'A BarberShop é uma barbearia com mais de 12 anos de serviços prestados e pode contar com os melhores profissionais de São Paulo para te atender.'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                  {currentTenant?.address || 'Avenida Sapopemba, 1020 - São Paulo, SP'}
                </span>
                <span className="flex items-center gap-1.5 font-medium font-mono">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  Atendimento das 09h às 21h
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            {currentTenant && (
              <button
                onClick={() => {
                  const url = getStorePublicUrl(currentTenant.slug);
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 font-bold text-xs border border-yellow-500/30 transition cursor-pointer"
                title="Copiar Link de Agendamento da Loja"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Link Copiado</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>Copiar Link da Loja</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`https://wa.me/55${(currentTenant?.phone || '11987654321').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Entrar em contato</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Services & Staff List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services Section */}
          <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-yellow-500" />
                Serviços Oferecidos
              </h2>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar serviços..."
                    value={searchServiceQuery}
                    onChange={(e) => setSearchServiceQuery(e.target.value)}
                    className="bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 w-44"
                  />
                  {searchServiceQuery && (
                    <button
                      onClick={() => setSearchServiceQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-yellow-500 font-semibold font-mono">{filteredServices.length} Opções</span>
              </div>
            </div>

            {isLoading ? (
              <CardSkeleton count={2} />
            ) : filteredServices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhum serviço encontrado para "{searchServiceQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-2">
                      <img
                        src={srv.image_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80'}
                        alt={srv.name}
                        className="w-full h-32 rounded-lg object-cover border border-slate-800"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <h3 className="text-sm font-bold text-white">{srv.name}</h3>
                        <span className="text-sm font-bold text-yellow-500 font-mono">R$ {srv.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-yellow-500" /> {srv.duration_minutes} min
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartBooking(srv)}
                      className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profissionais Disponíveis */}
          <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-500" />
                Profissionais Disponíveis
              </h2>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar barbeiro por nome..."
                  value={searchStaffQuery}
                  onChange={(e) => setSearchStaffQuery(e.target.value)}
                  className="bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 w-44"
                />
                {searchStaffQuery && (
                  <button
                    onClick={() => setSearchStaffQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <CardSkeleton count={3} />
            ) : filteredStaff.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Nenhum profissional encontrado para "{searchStaffQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {filteredStaff.map((st) => {
                  const isTopBarber = st.id === topBarberId;
                  return (
                    <div
                      key={st.id}
                      className={`bg-slate-800/30 border rounded-xl p-4 flex flex-col items-center text-center space-y-3 hover:border-slate-700 transition relative ${
                        isTopBarber
                          ? 'border-yellow-500/80 bg-gradient-to-b from-yellow-500/10 via-slate-800/30 to-slate-800/30 shadow-md shadow-yellow-500/10'
                          : 'border-slate-800'
                      }`}
                    >
                      {isTopBarber && (
                        <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-yellow-500 text-black font-extrabold text-[9px] uppercase font-mono shadow-md flex items-center gap-1 border border-yellow-400 tracking-wider">
                          <Crown className="w-3 h-3 fill-black" /> Top Barber
                        </span>
                      )}

                      <img
                        src={
                          st.avatar_url ||
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={st.name}
                        className={`w-16 h-16 rounded-full object-cover border-2 shadow-md ${
                          isTopBarber ? 'border-yellow-400 ring-2 ring-yellow-500/30' : 'border-yellow-500'
                        }`}
                      />
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center justify-center gap-1">
                          <span>{st.name}</span>
                          {isTopBarber && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                        </h3>
                        <p className="text-[10px] text-yellow-500 font-semibold mt-0.5">
                          {st.specialties?.[0] || 'Barbeiro'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleStartBooking(undefined, st)}
                        className="w-full py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[11px] active:scale-95 transition-all cursor-pointer shadow-sm"
                      >
                        Verificar agenda
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Meus Agendamentos" */}
        <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white">Meus Agendamentos</h2>
              <span className="text-xs text-slate-400 font-mono">{appointments.length} Ativos</span>
            </div>

            {isLoading ? (
              <ListSkeleton count={3} />
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">Você não possui agendamentos ativos.</p>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-slate-800/30 border border-slate-800 rounded-lg space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{apt.service_id || 'Corte & Estilo'}</span>
                        <span className="text-xs font-bold text-yellow-500 font-mono">R$ {apt.price ? apt.price.toFixed(2) : '0.00'}</span>
                      </div>

                      <p className="text-[11px] font-mono text-yellow-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {apt.date} - {apt.start_time} às {apt.end_time}
                      </p>

                      <p className="text-[11px] text-slate-400">Cliente: {apt.customer_name}</p>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {apt.status}
                        </span>

                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[10px] shadow-sm transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOOKING FLOW MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Agendamento Confirmado!</h3>
                <p className="text-xs text-slate-400">
                  Seu horário foi reservado com sucesso no <span className="text-yellow-500 font-bold">{currentTenant?.name}</span>.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Agendar Horário Online</h3>
                <p className="text-xs text-slate-400 mb-4">Selecione o serviço, data e insira seus dados.</p>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Profissional Desejado</label>
                    <select
                      value={selectedStaff?.id || ''}
                      onChange={(e) => {
                        const st = staffMembers.find((s) => s.id === e.target.value);
                        setSelectedStaff(st || null);
                      }}
                      className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      {staffMembers.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Serviço Escolhido</label>
                    <select
                      value={selectedService?.id || ''}
                      onChange={(e) => {
                        const srv = services.find((s) => s.id === e.target.value);
                        setSelectedService(srv || null);
                      }}
                      className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      {services
                        .filter((s) => {
                          if (selectedStaff?.service_ids && selectedStaff.service_ids.length > 0) {
                            return selectedStaff.service_ids.includes(s.id);
                          }
                          return true;
                        })
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} - R$ {s.price.toFixed(2)} ({s.duration_minutes} min)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Data do Atendimento</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                    />
                    {selectedStaff?.working_hours && selectedStaff.working_hours.length === 7 && selectedDate && (
                      (() => {
                        const dayNum = new Date(selectedDate + 'T00:00:00').getDay();
                        const dayConfig = selectedStaff.working_hours.find((h) => h.dayNum === dayNum);
                        if (dayConfig && !dayConfig.isOpen) {
                          return (
                            <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              O profissional {selectedStaff.name} não atende em {dayConfig.day}s. Por favor escolha outra data.
                            </p>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Horários Livres</label>
                    <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-1.5 text-[11px] font-bold rounded-lg border font-mono transition ${
                            selectedSlot === slot
                              ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                              : 'bg-[#0F1115] text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Seu Nome</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome Completo"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp</label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 98765-4321"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Opção de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('local')}
                        className={`p-2 rounded-lg text-xs font-semibold border ${
                          paymentMethod === 'local'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500'
                            : 'bg-[#0F1115] text-slate-400 border-slate-700'
                        }`}
                      >
                        Pagar no Estabelecimento
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online_simulated')}
                        className={`p-2 rounded-lg text-xs font-semibold border ${
                          paymentMethod === 'online_simulated'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500'
                            : 'bg-[#0F1115] text-slate-400 border-slate-700'
                        }`}
                      >
                        Pagamento Online (Simulado)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-extrabold text-black shadow-md shadow-yellow-500/20"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

