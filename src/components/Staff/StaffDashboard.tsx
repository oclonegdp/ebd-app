import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  DollarSign,
  Check,
  XCircle,
  AlertCircle,
  Settings,
  Edit,
  TrendingUp,
  Award,
  Scissors,
  Filter,
  Search,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { Appointment, Service, StaffMember } from '../../types';
import { UserProfileModal } from '../Auth/UserProfileModal';
import { AppointmentEditModal } from '../Owner/AppointmentEditModal';
import { StaffAvailability } from './StaffAvailability';
import { StaffServices } from './StaffServices';
import { StaffGamification } from './StaffGamification';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';
type TabType = 'agenda' | 'availability' | 'services' | 'gamification';

// Date helpers
function isSameDay(dateStr: string, refDate: Date): boolean {
  const todayStr = refDate.toISOString().split('T')[0];
  return dateStr === todayStr;
}

function isSameWeek(dateStr: string, refDate: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return false;

  const ref = new Date(refDate);
  const day = ref.getDay();
  // Monday as start of week
  const diffToMon = ref.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(ref.setDate(diffToMon));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return d >= startOfWeek && d <= endOfWeek;
}

function isSameMonth(dateStr: string, refDate: Date): boolean {
  const parts = dateStr.split('-');
  if (parts.length < 2) return false;
  const year = refDate.getFullYear().toString();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  return parts[0] === year && parts[1] === month;
}

export const StaffDashboard: React.FC = () => {
  const { currentUser, currentTenant } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('agenda');
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<string, Service>>({});
  const [myStaffProfile, setMyStaffProfile] = useState<StaffMember | null>(null);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  const loadData = () => {
    if (!currentTenant || !currentUser) return;

    // Get staff profiles for tenant
    const tenantStaff = storageEngine.getStaff(currentTenant.id);
    const staffProfile = tenantStaff.find(
      (s) => s.email.toLowerCase() === currentUser.email.toLowerCase()
    ) || null;
    setMyStaffProfile(staffProfile);

    // Get services map
    const services = storageEngine.getServices(currentTenant.id);
    const map: Record<string, Service> = {};
    services.forEach((s) => {
      map[s.id] = s;
    });
    setServicesMap(map);

    // Get appointments and filter strictly for THIS staff member
    const allTenantAppointments = storageEngine.getAppointments(currentTenant.id);
    const myFilteredAppointments = allTenantAppointments.filter((apt) => {
      if (staffProfile) {
        return apt.staff_id === staffProfile.id;
      }
      return apt.staff_id === currentUser.id;
    });

    setAppointments(myFilteredAppointments);
  };

  useEffect(() => {
    loadData();
  }, [currentTenant, currentUser]);

  const handleUpdateStatus = (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    const apt = appointments.find((a) => a.id === id);
    if (apt?.status === 'cancelled' && status === 'completed') return;
    storageEngine.updateAppointmentStatus(id, status);
    loadData();
  };

  // Filter appointments by selected period
  const now = new Date();
  const periodAppointments = appointments.filter((apt) => {
    if (period === 'today') return isSameDay(apt.date, now);
    if (period === 'week') return isSameWeek(apt.date, now);
    if (period === 'month') return isSameMonth(apt.date, now);
    return true; // 'all'
  });

  // Calculate Financial KPIs based on periodAppointments
  const totalPeriodCount = periodAppointments.length;
  const completedPeriodAppointments = periodAppointments.filter((a) => a.status === 'completed');
  const completedCount = completedPeriodAppointments.length;
  const confirmedCount = periodAppointments.filter((a) => a.status === 'confirmed').length;

  const completedRevenue = completedPeriodAppointments.reduce((acc, a) => acc + (a.price || 0), 0);

  // Commission Rate
  const commissionRate = myStaffProfile?.commission_rate ?? 50;
  const estimatedCommission = (completedRevenue * commissionRate) / 100;

  // Average Ticket
  const ticketMedio = completedCount > 0
    ? completedRevenue / completedCount
    : 0;

  // Further filter periodAppointments by Status and Search for the Agenda table
  const displayedAppointments = periodAppointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      apt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer_phone.includes(searchQuery) ||
      apt.date.includes(searchQuery);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">
              Painel do Profissional
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Unidade: <strong className="text-white">{currentTenant?.name}</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-yellow-500" />
            {currentUser?.full_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie sua agenda de atendimentos, controle seus ganhos por comissão e configure sua disponibilidade.
          </p>
        </div>

        {myStaffProfile && (
          <div className="flex items-center space-x-3 bg-[#0F1115] border border-slate-800 p-3 rounded-xl shrink-0">
            <img
              src={
                myStaffProfile.avatar_url ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
              }
              alt={myStaffProfile.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-yellow-500 shadow-sm"
            />
            <div>
              <p className="text-xs font-bold text-white">{myStaffProfile.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold">
                  Comissão: {commissionRate}%
                </span>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Perfil</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
              : 'bg-[#16191F] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Desempenho Financeiro</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'availability'
              ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
              : 'bg-[#16191F] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Minha Disponibilidade</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'services'
              ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
              : 'bg-[#16191F] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Meus Serviços & Comissão</span>
        </button>

        <button
          onClick={() => setActiveTab('gamification')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'gamification'
              ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
              : 'bg-[#16191F] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-yellow-500" />
          <span>Ranking & Conquistas</span>
        </button>
      </div>

      {/* TAB 1: AGENDA & FINANCIAL PERFORMANCE */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          {/* Financial Period Filter & KPIs Header */}
          <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                <div>
                  <h2 className="text-sm font-bold text-white">Resumo Financeiro & Faturamento</h2>
                  <p className="text-[11px] text-slate-400">
                    Acompanhe sua produção e ganhos calculados para o período selecionado.
                  </p>
                </div>
              </div>

              {/* Quick Period Filter Buttons */}
              <div className="flex items-center space-x-1.5 bg-[#0F1115] border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setPeriod('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    period === 'today'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    period === 'week'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    period === 'month'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Este Mês
                </button>
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    period === 'all'
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Geral
                </button>
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Faturado */}
              <div className="bg-[#0F1115] border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
                    Total Faturado
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  R$ {completedRevenue.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {completedCount} concluído(s) / {totalPeriodCount} total
                </p>
              </div>

              {/* Card 2: Serviços Concluídos */}
              <div className="bg-[#0F1115] border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
                    Serviços Concluídos
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-yellow-500 font-mono">
                  {completedCount}
                </p>
                <p className="text-[10px] text-slate-500">
                  {confirmedCount} pendente(s) de conclusão
                </p>
              </div>

              {/* Card 3: Comissão Estimada */}
              <div className="bg-[#0F1115] border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
                    Comissão Estimada
                  </span>
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  R$ {estimatedCommission.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Calculado a <strong className="text-yellow-500 font-mono">{commissionRate}%</strong> de comissão
                </p>
              </div>

              {/* Card 4: Ticket Médio */}
              <div className="bg-[#0F1115] border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
                    Ticket Médio
                  </span>
                  <PieChart className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  R$ {ticketMedio.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Média de valor por atendimento
                </p>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <h2 className="text-sm font-bold text-white">Atendimentos da Minha Agenda</h2>
                <span className="text-xs font-mono text-slate-400">
                  ({displayedAppointments.length} exibidos)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-56">
                  <input
                    type="text"
                    placeholder="Buscar por cliente, tel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0F1115] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#0F1115] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                >
                  <option value="all">Todos os Status</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="completed">Concluídos</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {displayedAppointments.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">
                    Nenhum atendimento encontrado para o período e filtros selecionados.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Alterne o período no topo (Hoje, Semana, Mês, Geral) ou limpe os filtros de busca.
                  </p>
                </div>
              ) : (
                displayedAppointments.map((apt) => {
                  const service = servicesMap[apt.service_id];
                  return (
                    <div
                      key={apt.id}
                      className="p-4 bg-slate-800/30 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">{apt.customer_name}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                            R$ {apt.price.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-xs text-yellow-500 font-semibold">
                          {service ? service.name : 'Serviço Agendado'}
                        </p>

                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>
                            WhatsApp:{' '}
                            <strong className="text-slate-200 font-mono">{apt.customer_phone}</strong>
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-mono text-yellow-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {apt.date} - {apt.start_time}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Pagamento: {apt.payment_method === 'online_simulated' ? 'Online' : 'No Local'}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center space-x-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase font-mono ${
                            apt.status === 'confirmed'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.25)]'
                              : apt.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                              : 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              apt.status === 'confirmed'
                                ? 'bg-yellow-400 animate-pulse'
                                : apt.status === 'completed'
                                ? 'bg-emerald-400'
                                : 'bg-red-400'
                            }`}
                          />
                          <span>
                            {apt.status === 'confirmed'
                              ? 'Confirmado'
                              : apt.status === 'completed'
                              ? 'Concluído'
                              : 'Cancelado'}
                          </span>
                        </span>

                        {/* Quick Status Action Buttons */}
                        <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                          {apt.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'completed')}
                              title="Marcar como Concluído"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 active:scale-95 transition-all cursor-pointer text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Concluir</span>
                            </button>
                          )}

                          {apt.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                              title="Cancelar Atendimento"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsAptModalOpen(true);
                            }}
                            title="Editar Detalhes"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 transition cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY & WORKING HOURS */}
      {activeTab === 'availability' && myStaffProfile && (
        <StaffAvailability staffProfile={myStaffProfile} onUpdated={loadData} />
      )}

      {/* TAB 3: SERVICES & COMMISSION */}
      {activeTab === 'services' && myStaffProfile && currentTenant && (
        <StaffServices
          staffProfile={myStaffProfile}
          tenantId={currentTenant.id}
          onUpdated={loadData}
        />
      )}

      {/* TAB 4: RANKING & GAMIFICATION */}
      {activeTab === 'gamification' && currentTenant && (
        <StaffGamification
          currentStaff={myStaffProfile}
          tenantId={currentTenant.id}
        />
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AppointmentEditModal
        appointment={selectedAppointment}
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        onUpdated={loadData}
      />
    </div>
  );
};
