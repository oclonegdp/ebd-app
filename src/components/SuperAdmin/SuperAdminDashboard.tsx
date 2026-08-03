import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Plus, Key, Copy, Check, Building2, Users, Calendar, AlertTriangle, RefreshCw, Link as LinkIcon, MessageSquare, Lock, Award, Clock, Edit3 } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { getStorePublicUrl, getWhatsAppShareUrl } from '../../lib/urlUtils';
import { Tenant, InvitationCode } from '../../types';
import { TenantLicenseModal } from './TenantLicenseModal';

export const SuperAdminDashboard: React.FC = () => {
  const { currentUser, createTenantSuperAdmin, refreshData } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLinkTenantId, setCopiedLinkTenantId] = useState<string | null>(null);

  // License Modal State
  const [selectedTenantForLicense, setSelectedTenantForLicense] = useState<Tenant | null>(null);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // Direct Creation Form State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Generate Invite State
  const [inviteRole, setInviteRole] = useState<'owner' | 'staff'>('owner');
  const [maxUses, setMaxUses] = useState<number>(10);

  const loadDashboardData = () => {
    setTenants(storageEngine.getTenants());
    setInvitations(storageEngine.getInvitationCodes());
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/30 rounded-xl max-w-lg mx-auto my-12 text-red-400">
        <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Acesso Restrito ao Super Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Apenas o administrador mestre pode acessar esta área.</p>
      </div>
    );
  }

  const handleCreateDirectTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      createTenantSuperAdmin({
        name,
        slug,
        ownerName,
        ownerEmail,
        ownerPassword,
        phone,
        address,
      });

      setFormSuccess(`Unidade "${name}" e conta do proprietário salvas no Auth com sucesso!`);
      setName('');
      setSlug('');
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setPhone('');
      setAddress('');
      setIsDirectModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar loja.');
    }
  };

  const handleGenerateInvite = () => {
    storageEngine.generateInvitationCode(inviteRole, undefined, maxUses);
    loadDashboardData();
  };

  const handleToggleStatus = (id: string) => {
    storageEngine.toggleTenantStatus(id);
    loadDashboardData();
    refreshData();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Top Banner */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Master Super Admin</h1>
              <p className="text-xs text-slate-400">
                Gestão central de Tenants, Licenciamento e Códigos de Convite Controlados.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDirectModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Loja Direta (Master)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Total de Unidades / Tenants</span>
            <Building2 className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{tenants.length}</p>
          <p className="text-[10px] text-emerald-400 font-medium">
            {tenants.filter((t) => t.active).length} ativas no sistema
          </p>
        </div>

        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Códigos de Convite Ativos</span>
            <Key className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{invitations.filter((i) => i.active).length}</p>
          <p className="text-[10px] text-slate-400 font-medium">Controle de entrada de novos parceiros</p>
        </div>

        <div className="p-5 bg-[#16191F] border border-slate-800 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">Segurança & RBAC</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">100% Blindado</p>
          <p className="text-[10px] text-slate-400 font-medium">Auto-cadastro livre desativado público</p>
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {formSuccess}
        </div>
      )}

      {/* Main 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of All Tenants */}
        <div className="lg:col-span-2 bg-[#16191F] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-yellow-500" />
              Lojas & Estabelecimentos Cadastrados
            </h2>
            <button
              onClick={loadDashboardData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          <div className="space-y-3">
            {tenants.map((tenant) => {
              const planName = (tenant.plan || 'pro').toUpperCase();
              const expStr = tenant.license_expires_at || 'Indefinida';
              const expDate = tenant.license_expires_at ? new Date(tenant.license_expires_at) : null;
              const today = new Date();
              const diffTime = expDate ? expDate.getTime() - today.getTime() : 0;
              const diffDays = expDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 999;

              return (
                <div
                  key={tenant.id}
                  className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl flex flex-col space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={tenant.logo_url}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-white">{tenant.name}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                            planName === 'ENTERPRISE'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : planName === 'PRO'
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}>
                            {planName}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-yellow-500 mt-0.5">slug: {tenant.slug}</p>
                        <p className="text-[10px] text-slate-400">{tenant.address || 'Sem endereço'}</p>
                      </div>
                    </div>

                    {/* License Badge & Remaining Days */}
                    <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <div className="text-[11px]">
                        <span className="text-slate-400">Validade: </span>
                        <span className="font-mono text-white font-bold">{expStr} </span>
                        <span className={`font-mono text-[10px] font-bold ${
                          diffDays < 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          ({diffDays < 0 ? `Expirado (${Math.abs(diffDays)}d)` : `${diffDays} dias`})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                          tenant.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {tenant.active ? 'Ativa' : 'Bloqueada'}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(tenant.id)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
                      >
                        {tenant.active ? 'Bloquear' : 'Liberar'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTenantForLicense(tenant);
                          setIsLicenseModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                      >
                        <Award className="w-3 h-3" />
                        <span>Gerenciar Licença</span>
                      </button>

                      <button
                        onClick={() => {
                          const url = getStorePublicUrl(tenant.slug);
                          navigator.clipboard.writeText(url);
                          setCopiedLinkTenantId(tenant.id);
                          setTimeout(() => setCopiedLinkTenantId(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Copiar Link Único da Vitrine"
                      >
                        {copiedLinkTenantId === tenant.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3 h-3" />
                            <span>Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={getWhatsAppShareUrl(tenant.name, tenant.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Compartilhar no WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Generator of Invitation Codes */}
        <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Key className="w-4 h-4 text-yellow-500" />
              Gerar Código de Convite
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Forneça tokens exclusivos para novos parceiros registrarem suas lojas no sistema.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nível de Permissão</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'owner' | 'staff')}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="owner">Dono de Loja (Owner)</option>
                  <option value="staff">Profissional de Equipe (Staff)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Limite Máximo de Usos</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  min={1}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <button
                onClick={handleGenerateInvite}
                className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Gerar Novo Token de Convite</span>
              </button>
            </div>
          </div>

          {/* Invitation Codes List */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Tokens Emitidos ({invitations.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-[#0F1115] border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-yellow-500 font-mono block">{inv.code}</span>
                    <p className="text-[10px] text-slate-400">
                      Função: <span className="capitalize">{inv.role}</span> | Usos: {inv.uses_count}/{inv.max_uses}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(inv.code)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Copiar código"
                  >
                    {copiedCode === inv.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DIRECT TENANT CREATION MODAL FOR SUPER ADMIN */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center space-x-2 text-yellow-500">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Criar Loja Direta (Master Super Admin)</h2>
            </div>
            <p className="text-xs text-slate-400">
              Crie um novo Tenant diretamente sem necessidade de código de convite.
            </p>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateDirectTenant} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Loja / Barbearia</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: EBD Barbearia Premium"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Slug / URL de Acesso</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ebd-barbearia-premium"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Proprietário *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Dantas"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail do Proprietário *</label>
                  <input
                    type="email"
                    required
                    placeholder="dono@exemplo.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Senha de Acesso do Proprietário (Supabase Auth) *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (mínimo 6 caracteres)"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Endereço Comercial</label>
                <input
                  type="text"
                  placeholder="Av. Paulista, 1000 - São Paulo, SP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-bold text-black shadow-md shadow-yellow-500/20"
                >
                  Criar Tenant Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* License Management Modal */}
      <TenantLicenseModal
        tenant={selectedTenantForLicense}
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onUpdated={loadDashboardData}
      />
    </div>
  );
};
