import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  Phone, 
  Check, 
  Plus, 
  Scissors, 
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffMember } from '../types';

export const StaffSection: React.FC = () => {
  const { 
    selectedBusiness, 
    staff, 
    appointments, 
    openBookingModal, 
    selectedStaffForAgenda, 
    setSelectedStaffForAgenda,
    addStaffMember,
    registerUserAccount,
    showToast,
    setActiveTab
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffBio, setNewStaffBio] = useState('');
  const [newStaffSpecialties, setNewStaffSpecialties] = useState('');

  const currentStaff = staff.filter(s => s.businessId === selectedBusiness.id);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    const created = addStaffMember({
      businessId: selectedBusiness.id,
      name: newStaffName,
      role: newStaffRole || 'Profissional',
      email: newStaffEmail || undefined,
      password: newStaffPassword || undefined,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=200&auto=format&fit=crop&q=80`,
      bio: newStaffBio || 'Profissional dedicado ao atendimento de alta qualidade.',
      rating: 5.0,
      specialties: newStaffSpecialties ? newStaffSpecialties.split(',').map(s => s.trim()) : ['Atendimento VIP'],
      availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      workStart: '08:00',
      workEnd: '18:00',
      phone: '(11) 99000-0000'
    });

    if (newStaffEmail && newStaffPassword) {
      registerUserAccount({
        name: newStaffName,
        email: newStaffEmail,
        password: newStaffPassword,
        role: 'staff',
        businessId: selectedBusiness.id,
        staffId: created.id
      });
      showToast(`Conta de acesso criada para ${newStaffName}! Ele(a) já pode entrar com o e-mail cadastrado.`);
    }

    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffEmail('');
    setNewStaffPassword('');
    setNewStaffBio('');
    setNewStaffSpecialties('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Equipe de Profissionais & Agendas</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Selecione um profissional para conferir a agenda individual e horários livres
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('expediente')}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Gerenciar Expedientes</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Profissional</span>
          </button>
        </div>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentStaff.map((member) => {
          const memberApps = appointments.filter(a => a.staffId === member.id);
          const todayIso = new Date().toISOString().split('T')[0];
          const todayApps = memberApps.filter(a => a.date === todayIso);

          return (
            <div 
              key={member.id}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition flex flex-col justify-between space-y-4 group relative"
            >
              {/* Profile Card Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {/* Circular Avatar */}
                  <div className="relative">
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500 transition"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900" title="Disponível"></span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-400">{member.role}</p>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{member.rating}</span>
                      <span className="text-zinc-500 font-normal">({memberApps.length} atendimentos)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {member.bio}
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.specialties.map((spec) => (
                    <span 
                      key={spec}
                      className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Working Hours & Today Stats */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{member.workStart} - {member.workEnd}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {todayApps.length} hoje
                  </span>
                </div>

                {/* Interactive Agenda Checker Button */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedStaffForAgenda(member)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ver Agenda</span>
                  </button>
                  <button
                    onClick={() => openBookingModal({ staffId: member.id })}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1"
                  >
                    <span>Agendar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Individual Agenda Modal / Drawer */}
      {selectedStaffForAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedStaffForAgenda.avatarUrl} 
                  alt={selectedStaffForAgenda.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Agenda Individual: {selectedStaffForAgenda.name}
                  </h3>
                  <p className="text-xs text-blue-400">{selectedStaffForAgenda.role} • Horário: {selectedStaffForAgenda.workStart} às {selectedStaffForAgenda.workEnd}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForAgenda(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Daily Schedule Slots for Selected Staff */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Agendamentos Marcados para Hoje ({selectedStaffForAgenda.name})
              </h4>

              {appointments.filter(a => a.staffId === selectedStaffForAgenda.id && a.date === new Date().toISOString().split('T')[0]).length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-200">Agenda livre para novos agendamentos hoje!</p>
                  <p className="text-[11px] text-zinc-500">Nenhum horário ocupado neste momento.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {appointments
                    .filter(a => a.staffId === selectedStaffForAgenda.id && a.date === new Date().toISOString().split('T')[0])
                    .map(app => (
                      <div key={app.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{app.clientName} ({app.timeSlot})</p>
                          <p className="text-[11px] text-blue-400">{app.serviceName}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {app.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Action */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedStaffForAgenda(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const stf = selectedStaffForAgenda;
                  setSelectedStaffForAgenda(null);
                  openBookingModal({ staffId: stf.id });
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25"
              >
                Agendar com este Profissional
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Cadastrar Profissional</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Ex: Gabriel Siqueira"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <div>
                  <label className="block text-blue-300 font-semibold mb-1">E-mail de Acesso (Login)</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="profissional@loja.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-blue-300 font-semibold mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="Senha individual"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Cargo / Especialidade Principal</label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="Ex: Barbeiro Master / Personal"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newStaffSpecialties}
                  onChange={(e) => setNewStaffSpecialties(e.target.value)}
                  placeholder="Ex: Degradê, Barboterapia, Coloração"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Pequena Biografia</label>
                <textarea
                  value={newStaffBio}
                  onChange={(e) => setNewStaffBio(e.target.value)}
                  placeholder="Experiência e diferenciais..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Salvar Cadastrado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
