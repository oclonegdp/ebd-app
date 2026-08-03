import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  ShieldCheck, 
  Scissors, 
  Users, 
  Calendar,
  Search,
  KeyRound,
  Lock,
  LogOut,
  ShieldAlert,
  ArrowRight,
  Edit3,
  Trash2,
  CalendarClock,
  AlertTriangle
} from 'lucide-react';
import { useApp, isSuperAdminCredential } from '../context/AppContext';
import { BusinessCategory, Business, UserRole } from '../types';

export const SuperAdminModal: React.FC = () => {
  const { 
    isSuperAdminModalOpen, 
    setIsSuperAdminModalOpen, 
    businesses, 
    addBusiness,
    updateBusiness,
    deleteBusiness,
    extendBusinessPlan, 
    setSelectedBusinessId,
    services,
    staff,
    appointments,
    currentUser,
    setCurrentUser,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Super Admin Master Authentication State
  const [adminLoginInput, setAdminLoginInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState(false);

  // Form State for creating a new business tenant
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('barbearia');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('São Paulo, SP');
  const [address, setAddress] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals for Edit and Delete
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(null);

  if (!isSuperAdminModalOpen) return null;

  const isUserSuperAdmin = currentUser?.role === 'superadmin' || isSuperAdminAuthenticated;

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Credenciais mestras apenas via variáveis de ambiente (nunca hardcoded/visíveis na UI)
    if (isSuperAdminCredential(adminLoginInput, adminPasswordInput)) {
      const superAdminUser = {
        id: 'usr_superadmin',
        name: 'El Bravo Dantas (Super Admin)',
        email: adminLoginInput.trim().toLowerCase(),
        role: 'superadmin' as UserRole,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '(11) 98000-0000'
      };
      setCurrentUser(superAdminUser);
      setIsSuperAdminAuthenticated(true);
      setAuthError('');
      showToast('Autenticação de Super Admin validada com sucesso!');
    } else {
      setAuthError('Login ou Senha Mestre incorretos.');
      showToast('Falha no login de Super Admin.');
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!inviteCode) {
      const generatedCode = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10) + '2026';
      setInviteCode(generatedCode);
    }
    if (!slug) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !inviteCode || !ownerEmail || !ownerPassword) {
      showToast('Por favor, preencha o nome, e-mail e senha de acesso do proprietário.');
      return;
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const exists = businesses.some(b => b.inviteCode.toUpperCase() === cleanCode);
    if (exists) {
      showToast('Este código de convite já está em uso por outro estabelecimento.');
      return;
    }

    const newBizData: Omit<Business, 'id'> = {
      name,
      category,
      description: description || `Estabelecimento de ${category} com atendimento personalizado.`,
      inviteCode: cleanCode,
      slug: slug || cleanCode.toLowerCase(),
      ownerName: ownerName || 'Proprietário',
      ownerEmail,
      ownerPassword,
      logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
      coverBannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
      address: address || 'Endereço Comercial Cadastrado',
      city,
      phone: phone || '(11) 99999-0000',
      whatsapp: '55' + (phone.replace(/\D/g, '') || '11999990000'),
      email: ownerEmail,
      rating: 5.0,
      totalReviews: 1,
      isOpen: true,
      workingHours: 'Segunda a Sábado, 09:00 às 19:00',
      slotIntervalMinutes: 30
    };

    addBusiness(newBizData);
    setActiveTab('list');
    
    // Reset form
    setName('');
    setDescription('');
    setInviteCode('');
    setSlug('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setPhone('');
    setAddress('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    updateBusiness(editingBusiness.id, editingBusiness);
    setEditingBusiness(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingBusiness) return;
    deleteBusiness(deletingBusiness.id);
    setDeletingBusiness(null);
  };

  const copyInviteLink = (b: Business) => {
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?code=${b.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(b.id);
    showToast(`Link exclusivo do ${b.name} copiado para a área de transferência!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const copyCodeOnly = (b: Business) => {
    navigator.clipboard.writeText(b.inviteCode);
    setCopiedCode(`code_${b.id}`);
    showToast(`Código de convite "${b.inviteCode}" copiado!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getDaysRemaining = (expDateStr?: string) => {
    if (!expDateStr) return 30;
    const exp = new Date(expDateStr);
    const today = new Date();
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.inviteCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.ownerName && b.ownerName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">Painel Gestor Super Admin</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Acesso Restrito
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Crie estabelecimentos e gerencie acessos isolados de cada loja
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSuperAdminModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NOT Authenticated as Super Admin: Render Lock Login Screen */}
        {!isUserSuperAdmin ? (
          <div className="p-8 max-w-md mx-auto w-full my-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Autenticação Mestre Exigida</h3>
              <p className="text-xs text-zinc-400">
                Informe o login e a senha mestre de Super Admin para gerenciar os estabelecimentos.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSuperAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Login / E-mail de Super Admin
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Login do Super Admin"
                    value={adminLoginInput}
                    onChange={(e) => setAdminLoginInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Senha Mestre do Sistema
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Senha Mestre"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition active:scale-[0.98]"
              >
                <span>Validar Credenciais & Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs inside modal when authenticated */}
            <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'list' 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Empresas Cadastradas ({businesses.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'create' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Nova Empresa & Gerar Convite</span>
                </button>
              </div>

              {activeTab === 'list' && (
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou código..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeTab === 'list' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBusinesses.map((b) => {
                      const bServices = services.filter(s => s.businessId === b.id).length;
                      const bStaff = staff.filter(s => s.businessId === b.id).length;
                      const bAppointments = appointments.filter(a => a.businessId === b.id).length;
                      const daysLeft = getDaysRemaining(b.planExpiresAt);

                      return (
                        <div 
                          key={b.id} 
                          className="p-5 bg-zinc-950/90 rounded-xl border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={b.logoUrl} 
                                  alt={b.name} 
                                  className="w-11 h-11 rounded-lg object-cover border border-zinc-800"
                                />
                                <div>
                                  <h3 className="text-sm font-bold text-white">{b.name}</h3>
                                  <p className="text-[11px] text-zinc-400">{b.address}, {b.city}</p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                                {b.category}
                              </span>
                            </div>

                            {/* Owner & Invite Info */}
                            <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs">
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Proprietário / Email</span>
                                <span className="text-zinc-200 font-medium truncate block">{b.ownerName || 'Não especificado'}</span>
                                <span className="text-zinc-400 text-[11px] truncate block">{b.ownerEmail || b.email}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Código do Convite</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="px-2 py-0.5 font-mono text-xs font-bold bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                                    {b.inviteCode}
                                  </span>
                                  <button
                                    onClick={() => copyCodeOnly(b)}
                                    className="p-1 text-zinc-400 hover:text-blue-400 rounded transition"
                                    title="Copiar código de convite"
                                  >
                                    {copiedCode === `code_${b.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Plan Expiration & Extend Controls */}
                            <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400 flex items-center gap-1">
                                  <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Validade do Plano:</span>
                                </span>
                                <span className={`font-bold ${daysLeft <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirado'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Estender:</span>
                                <button
                                  onClick={() => extendBusinessPlan(b.id, 15)}
                                  className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[10px] font-bold border border-indigo-500/40 transition"
                                >
                                  +15 Dias
                                </button>
                                <button
                                  onClick={() => extendBusinessPlan(b.id, 30)}
                                  className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[10px] font-bold border border-indigo-500/40 transition"
                                >
                                  +30 Dias
                                </button>
                                <button
                                  onClick={() => extendBusinessPlan(b.id, 90)}
                                  className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[10px] font-bold border border-indigo-500/40 transition"
                                >
                                  +90 Dias
                                </button>
                              </div>
                            </div>

                            {/* Scoped Isolated Metrics */}
                            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                              <span className="flex items-center gap-1">
                                <Scissors className="w-3.5 h-3.5 text-blue-400" /> {bServices} Serviços
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-indigo-400" /> {bStaff} Profissionais
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {bAppointments} Agendamentos
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                            <button
                              onClick={() => {
                                setSelectedBusinessId(b.id);
                                setIsSuperAdminModalOpen(false);
                              }}
                              className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition text-center"
                            >
                              Acessar Empresa
                            </button>
                            <button
                              onClick={() => setEditingBusiness(b)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                              title="Editar Dados da Empresa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingBusiness(b)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                              title="Excluir Empresa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyInviteLink(b)}
                              className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition"
                              title="Copiar Link de Convite Direto"
                            >
                              {copiedCode === b.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-zinc-800 pb-3">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Cadastrar Novo Estabelecimento por Fora</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome da Empresa / Salão *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Toni do Corte ou Corte Artes"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="barbearia">Barbearia</option>
                        <option value="beleza">Salão de Beleza / Estética</option>
                        <option value="academia">Academia / Fitness</option>
                        <option value="saude">Saúde & Bem-Estar</option>
                        <option value="outros">Outros Serviços</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        Código de Convite Exclusivo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: TONI2026 ou CORTEARTES"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Slug na URL (Identificador)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: toni-do-corte"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase())}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Owner Credentials */}
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Credenciais de Acesso do Proprietário (Dono do Salão)</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Nome do Dono
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Toni Barbeiro"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          E-mail de Login *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="dono@tonidocorte.com"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Senha de Acesso *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Senha de acesso do dono"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="(11) 97123-1122"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Endereço Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Rua Augusta, 1200 - Consolação"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Descrição Curta do Estabelecimento
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Escreva sobre os diferenciais da barbearia ou salão..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Empresa & Gerar Link Isolado</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Multi-Tenant DB Isolation Active</span>
          </span>
          {isUserSuperAdmin && (
            <button
              onClick={() => {
                setIsSuperAdminAuthenticated(false);
                setCurrentUser(null);
                showToast('Super Admin desconectado.');
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Super Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Business Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Editar Estabelecimento</span>
              </h3>
              <button onClick={() => setEditingBusiness(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome do Estabelecimento</label>
                <input
                  type="text"
                  required
                  value={editingBusiness.name}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Código de Convite</label>
                  <input
                    type="text"
                    required
                    value={editingBusiness.inviteCode}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, inviteCode: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-emerald-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={editingBusiness.category}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, category: e.target.value as BusinessCategory })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  >
                    <option value="barbearia">Barbearia</option>
                    <option value="beleza">Salão de Beleza / Estética</option>
                    <option value="academia">Academia / Fitness</option>
                    <option value="saude">Saúde & Bem-Estar</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Nome do Proprietário</label>
                  <input
                    type="text"
                    value={editingBusiness.ownerName || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, ownerName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">E-mail do Proprietário</label>
                  <input
                    type="email"
                    value={editingBusiness.ownerEmail || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, ownerEmail: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Senha de Acesso do Proprietário</label>
                <input
                  type="text"
                  placeholder="Definir/atualizar senha do dono"
                  value={editingBusiness.ownerPassword || ''}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, ownerPassword: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editingBusiness.phone}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Endereço</label>
                  <input
                    type="text"
                    value={editingBusiness.address}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBusiness && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 space-y-4 text-zinc-100">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Excluir Empresa</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o estabelecimento <strong className="text-white">{deletingBusiness.name}</strong>?
            </p>
            <p className="text-[11px] text-zinc-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              ⚠️ Esta ação é irreversível e removerá todos os agendamentos, serviços, profissionais e dados isolados vinculados a esta empresa.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingBusiness(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25"
              >
                Sim, Excluir Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
