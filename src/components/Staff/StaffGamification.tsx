import React, { useState, useEffect } from 'react';
import { Trophy, Award, Crown, Zap, Flame, Star, CheckCircle2, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { StaffMember, Appointment, Service } from '../../types';

interface StaffGamificationProps {
  currentStaff: StaffMember | null;
  tenantId: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'appointments' | 'revenue' | 'ranking' | 'speed' | 'luxury';
  isUnlocked: boolean;
  progress: number; // 0 to 100
  reqText: string;
}

export interface StaffRankingStats {
  staff: StaffMember;
  totalAppointments: number;
  completedAppointments: number;
  grossRevenue: number;
  premiumServicesCount: number;
  totalXP: number;
  weeklyXP: number;
  monthlyXP: number;
  rankWeekly: number;
  rankOverall: number;
  badges: Badge[];
}

// Utility function to compute gamification stats for all staff members of a tenant
export function computeTenantGamification(tenantId: string): StaffRankingStats[] {
  const staffList = storageEngine.getStaff(tenantId);
  const appointments = storageEngine.getAppointments(tenantId);
  const services = storageEngine.getServices(tenantId);

  const now = new Date();

  // Helper date functions
  const isSameWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    const ref = new Date(now);
    const day = ref.getDay();
    const diffToMon = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(ref.setDate(diffToMon));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return d >= startOfWeek && d <= endOfWeek;
  };

  const isSameMonth = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 2) return false;
    return parts[0] === now.getFullYear().toString() && parts[1] === String(now.getMonth() + 1).padStart(2, '0');
  };

  // Map services for quick price check
  const serviceMap = new Map<string, Service>();
  services.forEach((s) => serviceMap.set(s.id, s));

  // Compute raw stats per staff
  const statsList: Array<{
    staff: StaffMember;
    totalAppointments: number;
    completedAppointments: number;
    grossRevenue: number;
    premiumServicesCount: number;
    maxAppointmentsInSingleDay: number;
    weeklyXP: number;
    monthlyXP: number;
    totalXP: number;
  }> = staffList.map((s) => {
    const myApts = appointments.filter((a) => a.staff_id === s.id && a.status === 'completed');

    let totalRev = 0;
    let premiumCount = 0;
    let weeklyXP = 0;
    let monthlyXP = 0;
    let totalXP = 0;

    const dayCounts: Record<string, number> = {};

    myApts.forEach((apt) => {
      const price = apt.price || 0;
      totalRev += price;

      // Check if premium service
      const srv = serviceMap.get(apt.service_id);
      const isPremium = price >= 50 || (srv && srv.price >= 50);
      if (isPremium) premiumCount++;

      // Points formula: 100 XP per completed + 10 XP per R$1 + 50 XP if premium
      const aptXP = 100 + Math.round(price * 10) + (isPremium ? 50 : 0);

      totalXP += aptXP;
      if (isSameWeek(apt.date)) weeklyXP += aptXP;
      if (isSameMonth(apt.date)) monthlyXP += aptXP;

      dayCounts[apt.date] = (dayCounts[apt.date] || 0) + 1;
    });

    const maxDay = Object.values(dayCounts).reduce((max, count) => Math.max(max, count), 0);

    return {
      staff: s,
      totalAppointments: appointments.filter((a) => a.staff_id === s.id).length,
      completedAppointments: myApts.length,
      grossRevenue: totalRev,
      premiumServicesCount: premiumCount,
      maxAppointmentsInSingleDay: maxDay,
      weeklyXP,
      monthlyXP,
      totalXP,
    };
  });

  // Sort by weekly XP to assign weekly ranks
  const sortedByWeekly = [...statsList].sort((a, b) => b.weeklyXP - a.weeklyXP);
  const weeklyRanksMap = new Map<string, number>();
  sortedByWeekly.forEach((item, idx) => weeklyRanksMap.set(item.staff.id, idx + 1));

  // Sort by total XP for overall ranks
  const sortedByOverall = [...statsList].sort((a, b) => b.totalXP - a.totalXP);
  const overallRanksMap = new Map<string, number>();
  sortedByOverall.forEach((item, idx) => overallRanksMap.set(item.staff.id, idx + 1));

  // Build final StaffRankingStats list
  return statsList.map((item) => {
    const rankWeekly = weeklyRanksMap.get(item.staff.id) || 99;
    const rankOverall = overallRanksMap.get(item.staff.id) || 99;

    const badges: Badge[] = [
      {
        id: 'badge_first_cut',
        title: 'Iniciante de Elite',
        description: 'Realizou o 1º atendimento concluído na barbearia.',
        icon: '🥉',
        category: 'appointments',
        isUnlocked: item.completedAppointments >= 1,
        progress: Math.min(100, Math.round((item.completedAppointments / 1) * 100)),
        reqText: '1 Atendimento Concluído',
      },
      {
        id: 'badge_master_scissors',
        title: 'Mestre das Tesouras',
        description: 'Concluiu 10 ou mais atendimentos com excelência.',
        icon: '🥈',
        category: 'appointments',
        isUnlocked: item.completedAppointments >= 10,
        progress: Math.min(100, Math.round((item.completedAppointments / 10) * 100)),
        reqText: `${item.completedAppointments}/10 Atendimentos`,
      },
      {
        id: 'badge_legendary',
        title: 'Barbeiro Lendário',
        description: 'Marca histórica de 50 atendimentos realizados.',
        icon: '🥇',
        category: 'appointments',
        isUnlocked: item.completedAppointments >= 50,
        progress: Math.min(100, Math.round((item.completedAppointments / 50) * 100)),
        reqText: `${item.completedAppointments}/50 Atendimentos`,
      },
      {
        id: 'badge_diamond_rev',
        title: 'Faturamento Diamante',
        description: 'Gerou R$ 1.000,00 ou mais em faturamento bruto.',
        icon: '💎',
        category: 'revenue',
        isUnlocked: item.grossRevenue >= 1000,
        progress: Math.min(100, Math.round((item.grossRevenue / 1000) * 100)),
        reqText: `R$ ${item.grossRevenue.toFixed(0)} / R$ 1.000`,
      },
      {
        id: 'badge_top_barber_week',
        title: 'Top Barber Semanal',
        description: 'Alcançou o 1º LUGAR no Ranking da Semana da barbearia!',
        icon: '👑',
        category: 'ranking',
        isUnlocked: rankWeekly === 1 && item.weeklyXP > 0,
        progress: rankWeekly === 1 && item.weeklyXP > 0 ? 100 : 0,
        reqText: rankWeekly === 1 ? '1º Lugar Conquistado!' : 'Atualmente #' + rankWeekly,
      },
      {
        id: 'badge_speedster',
        title: 'Velocista das Cadeiras',
        description: 'Concluiu 5 ou mais atendimentos no mesmo dia.',
        icon: '⚡',
        category: 'speed',
        isUnlocked: item.maxAppointmentsInSingleDay >= 5,
        progress: Math.min(100, Math.round((item.maxAppointmentsInSingleDay / 5) * 100)),
        reqText: `${item.maxAppointmentsInSingleDay}/5 num único dia`,
      },
      {
        id: 'badge_luxury_expert',
        title: 'Especialista Luxo',
        description: 'Realizou 5 ou mais serviços VIP/Premium (≥ R$ 50).',
        icon: '🌟',
        category: 'luxury',
        isUnlocked: item.premiumServicesCount >= 5,
        progress: Math.min(100, Math.round((item.premiumServicesCount / 5) * 100)),
        reqText: `${item.premiumServicesCount}/5 Serviços VIP`,
      },
    ];

    return {
      staff: item.staff,
      totalAppointments: item.totalAppointments,
      completedAppointments: item.completedAppointments,
      grossRevenue: item.grossRevenue,
      premiumServicesCount: item.premiumServicesCount,
      totalXP: item.totalXP,
      weeklyXP: item.weeklyXP,
      monthlyXP: item.monthlyXP,
      rankWeekly,
      rankOverall,
      badges,
    };
  });
}

export const StaffGamification: React.FC<StaffGamificationProps> = ({
  currentStaff,
  tenantId,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'weekly' | 'monthly' | 'total'>('weekly');
  const [rankingStats, setRankingStats] = useState<StaffRankingStats[]>([]);

  useEffect(() => {
    const computed = computeTenantGamification(tenantId);
    setRankingStats(computed);
  }, [tenantId]);

  // Sort according to active filter
  const sortedList = [...rankingStats].sort((a, b) => {
    if (filterPeriod === 'weekly') return b.weeklyXP - a.weeklyXP;
    if (filterPeriod === 'monthly') return b.monthlyXP - a.monthlyXP;
    return b.totalXP - a.totalXP;
  });

  const myStats = rankingStats.find((s) => s.staff.id === currentStaff?.id) || null;

  const top1 = sortedList[0] || null;
  const top2 = sortedList[1] || null;
  const top3 = sortedList[2] || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#16191F] via-[#1A1E26] to-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 uppercase flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Gamificação & Ranking da Equipe
            </span>
          </div>

          <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>Ranking de Desempenho & Conquistas</span>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Acumule pontos de experiência (XP) executando atendimentos e serviços premium. O lider do ranking da semana ganha o selo visual 👑 Top Barber na vitrine pública de agendamento!
          </p>
        </div>

        {/* My XP Card */}
        {myStats && (
          <div className="bg-[#0F1115] border border-yellow-500/30 p-3.5 rounded-xl flex items-center gap-3 shrink-0 shadow-lg shadow-yellow-500/5">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
                Seu XP Acumulado
              </span>
              <p className="text-lg font-black text-yellow-400 font-mono">
                {myStats.totalXP} <span className="text-xs text-slate-400 font-normal">XP</span>
              </p>
              <p className="text-[10px] text-emerald-400 font-mono font-bold">
                Ranking Semanal: #{myStats.rankWeekly} de {rankingStats.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Podium Section */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Pódio dos Melhores Profissionais
            </h3>
            <p className="text-[11px] text-slate-400">
              Profissionais em destaque na barbearia no período selecionado.
            </p>
          </div>

          {/* Filter Selector */}
          <div className="flex items-center space-x-1.5 bg-[#0F1115] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                filterPeriod === 'weekly'
                  ? 'bg-yellow-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFilterPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                filterPeriod === 'monthly'
                  ? 'bg-yellow-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setFilterPeriod('total')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                filterPeriod === 'total'
                  ? 'bg-yellow-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Geral / Histórico
            </button>
          </div>
        </div>

        {/* Podium Displays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
          {/* 2nd Place */}
          {top2 ? (
            <div className="bg-[#0F1115] border border-slate-800 rounded-2xl p-4 text-center space-y-3 relative order-2 md:order-1 hover:border-slate-700 transition">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 border border-slate-600 font-black text-[10px] font-mono shadow-sm">
                🥈 2º LUGAR
              </div>

              <img
                src={
                  top2.staff.avatar_url ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                }
                alt={top2.staff.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-500 mx-auto shadow-md mt-2"
              />

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{top2.staff.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {top2.completedAppointments} atendimentos | R$ {top2.grossRevenue.toFixed(0)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-300 font-mono">
                  {filterPeriod === 'weekly' ? top2.weeklyXP : filterPeriod === 'monthly' ? top2.monthlyXP : top2.totalXP} XP
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F1115]/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-600 order-2 md:order-1 text-xs font-mono">
              2º Lugar sem competidor
            </div>
          )}

          {/* 1st Place - Champion */}
          {top1 ? (
            <div className="bg-gradient-to-b from-yellow-500/10 via-[#0F1115] to-[#0F1115] border-2 border-yellow-500/60 rounded-2xl p-5 text-center space-y-3 relative order-1 md:order-2 shadow-xl shadow-yellow-500/10 transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-500 text-black font-black text-xs font-mono shadow-lg flex items-center gap-1 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 fill-black" />
                1º LUGAR - TOP BARBER
              </div>

              <div className="relative inline-block mt-3">
                <img
                  src={
                    top1.staff.avatar_url ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={top1.staff.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500 mx-auto shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-yellow-500 text-black rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{top1.staff.name}</h4>
                <p className="text-[11px] text-yellow-500 font-mono font-bold mt-0.5">
                  👑 Líder do Ranking com {filterPeriod === 'weekly' ? top1.weeklyXP : filterPeriod === 'monthly' ? top1.monthlyXP : top1.totalXP} XP
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {top1.completedAppointments} atendimentos | R$ {top1.grossRevenue.toFixed(0)} faturado
                </p>
              </div>

              <div className="pt-2 border-t border-yellow-500/20">
                <span className="text-[10px] font-bold text-yellow-400 uppercase font-mono tracking-wider block">
                  Selo de Destaque Ativo na Vitrine
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F1115]/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-600 order-1 md:order-2 text-xs font-mono">
              Sem dados suficientes no pódio
            </div>
          )}

          {/* 3rd Place */}
          {top3 ? (
            <div className="bg-[#0F1115] border border-slate-800 rounded-2xl p-4 text-center space-y-3 relative order-3 hover:border-slate-700 transition">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-800/80 text-amber-200 border border-amber-700 font-black text-[10px] font-mono shadow-sm">
                🥉 3º LUGAR
              </div>

              <img
                src={
                  top3.staff.avatar_url ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                }
                alt={top3.staff.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 mx-auto shadow-md mt-2"
              />

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{top3.staff.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {top3.completedAppointments} atendimentos | R$ {top3.grossRevenue.toFixed(0)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-300 font-mono">
                  {filterPeriod === 'weekly' ? top3.weeklyXP : filterPeriod === 'monthly' ? top3.monthlyXP : top3.totalXP} XP
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F1115]/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-600 order-3 text-xs font-mono">
              3º Lugar sem competidor
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-500" />
          Tabela Completa do Ranking da Equipe
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono font-bold uppercase text-slate-400">
                <th className="pb-3 pl-2">Posição</th>
                <th className="pb-3">Profissional</th>
                <th className="pb-3">Atendimentos</th>
                <th className="pb-3">Faturamento</th>
                <th className="pb-3">Serviços VIP</th>
                <th className="pb-3 pr-2 text-right">Pontuação XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {sortedList.map((item, index) => {
                const isMe = item.staff.id === currentStaff?.id;
                const points = filterPeriod === 'weekly' ? item.weeklyXP : filterPeriod === 'monthly' ? item.monthlyXP : item.totalXP;

                return (
                  <tr
                    key={item.staff.id}
                    className={`hover:bg-slate-900/60 transition ${
                      isMe ? 'bg-yellow-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 pl-2 font-mono font-black text-slate-300">
                      {index === 0 ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          👑 #1
                        </span>
                      ) : index === 1 ? (
                        <span className="text-slate-300">🥈 #2</span>
                      ) : index === 2 ? (
                        <span className="text-amber-500">🥉 #3</span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>

                    <td className="py-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={
                            item.staff.avatar_url ||
                            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={item.staff.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{item.staff.name}</span>
                            {isMe && (
                              <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">
                                Você
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-slate-300">
                      {item.completedAppointments} cortes
                    </td>

                    <td className="py-3 font-mono text-emerald-400 font-bold">
                      R$ {item.grossRevenue.toFixed(2)}
                    </td>

                    <td className="py-3 font-mono text-yellow-500">
                      {item.premiumServicesCount} realizações
                    </td>

                    <td className="py-3 pr-2 text-right font-mono font-black text-yellow-400 text-sm">
                      {points} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges / Unlockable Conquistas Section */}
      {myStats && (
        <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                Minhas Conquistas & Medalhas ({myStats.badges.filter((b) => b.isUnlocked).length} de {myStats.badges.length} desbloqueadas)
              </h3>
              <p className="text-[11px] text-slate-400">
                Atinja as metas para desbloquear medalhas de especialista e ganhar pontuação XP bônus.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myStats.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  badge.isUnlocked
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {badge.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{badge.description}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={badge.isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {badge.isUnlocked ? 'Desbloqueado!' : badge.reqText}
                    </span>
                    <span className="text-slate-400">{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        badge.isUnlocked ? 'bg-yellow-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
