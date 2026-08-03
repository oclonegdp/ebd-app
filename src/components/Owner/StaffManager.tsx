import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, X, Search, Filter, Lock, ShieldCheck, CheckCircle2, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { StaffMember } from '../../types';
import { CardSkeleton } from '../UI/LoadingSkeleton';
import { ImageUploader } from '../UI/ImageUploader';

export const StaffManager: React.FC = () => {
  const { currentTenant } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Delete modal/confirm state
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  const loadStaff = () => {
    if (currentTenant) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setStaff(storageEngine.getStaff(currentTenant.id));
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [currentTenant]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setBio('');
    setSpecialtyInput('');
    setAvatarUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (st: StaffMember) => {
    setEditingStaff(st);
    setName(st.name || '');
    setEmail(st.email || '');
    setPassword('');
    setPhone(st.phone || '');
    setBio(st.bio || '');
    setSpecialtyInput(st.specialties ? st.specialties.join(', ') : '');
    setAvatarUrl(st.avatar_url || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const specialtiesList = specialtyInput
      ? specialtyInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Barbeiro'];

    if (editingStaff) {
      storageEngine.saveStaffMember(
        {
          id: editingStaff.id,
          tenant_id: currentTenant.id,
          name,
          email,
          phone,
          bio,
          avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          specialties: specialtiesList,
        },
        password || undefined
      );

      setSuccessMessage(`Dados do profissional ${name} atualizados com sucesso!`);
    } else {
      storageEngine.saveStaffMember(
        {
          tenant_id: currentTenant.id,
          name,
          email,
          phone,
          bio,
          avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          specialties: specialtiesList,
        },
        password
      );

      setSuccessMessage(`Profissional ${name} e conta de acesso 'staff' cadastrada com sucesso!`);
    }

    setTimeout(() => setSuccessMessage(null), 4000);

    loadStaff();
    setIsModalOpen(false);
  };

  const confirmDeleteStaff = () => {
    if (!staffToDelete) return;
    storageEngine.deleteStaffMember(staffToDelete.id);
    setSuccessMessage(`Profissional ${staffToDelete.name} removido com sucesso.`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setStaffToDelete(null);
    loadStaff();
  };

  // Filter staff by search query (name, email, specialty)
  const filteredStaff = staff.filter((st) => {
    const query = searchQuery.toLowerCase();
    const matchesName = st.name.toLowerCase().includes(query);
    const matchesEmail = st.email.toLowerCase().includes(query);
    const matchesSpecialty = st.specialties.some((spec) => spec.toLowerCase().includes(query));

    return matchesName || matchesEmail || matchesSpecialty;
  });

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            Equipe de Profissionais & Barbeiros
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os barbeiros e profissionais de atendimento da sua unidade (vinculados à role 'staff').
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Profissional</span>
        </button>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar profissional por nome ou especialidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Exibindo {filteredStaff.length} de {staff.length} profissionais
        </span>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : filteredStaff.length === 0 ? (
        <div className="bg-[#16191F] border border-slate-800 rounded-xl p-12 text-center space-y-2">
          <Filter className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Nenhum profissional encontrado.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-yellow-500 underline font-semibold cursor-pointer"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((st) => (
            <div
              key={st.id}
              className="bg-[#16191F] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-3.5">
                <img
                  src={st.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
                  alt={st.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500 shrink-0 shadow-md"
                />
                <div className="overflow-hidden space-y-0.5">
                  <h3 className="text-sm font-bold text-white truncate">{st.name}</h3>
                  <p className="text-xs text-slate-400 truncate font-mono">{st.email}</p>
                  {st.phone && <p className="text-[11px] text-slate-500">{st.phone}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {st.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons for CRUD */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(st)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-500 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setStaffToDelete(st)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">
                {editingStaff ? 'Editar Dados do Profissional' : 'Novo Profissional de Atendimento'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingStaff
                  ? 'Altere a foto, nome, especialidades ou contato do profissional.'
                  : "Cadastre a conta vinculada à loja com role 'staff'."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[11px] text-yellow-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span>
                A conta está associada ao ID da loja (<strong>{currentTenant?.id}</strong>) e possui acesso de Profissional.
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@barber.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Senha {editingStaff ? '(Deixe em branco para não alterar)' : '*'}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingStaff}
                    minLength={6}
                    placeholder="•••••••• (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Corte Degradê, Barba Terapia, Visagismo"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <ImageUploader
                currentImageUrl={avatarUrl}
                onImageUploaded={(url) => setAvatarUrl(url)}
                label="Foto de Perfil do Profissional"
                folder="staff"
                aspectRatio="avatar"
                placeholderText="Selecione a foto do celular/PC ou informe uma URL externa."
              />

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-bold text-black shadow-md shadow-yellow-500/20 transition cursor-pointer"
                >
                  {editingStaff ? 'Atualizar Dados' : 'Cadastrar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Confirmar Exclusão</h3>
            </div>

            <p className="text-xs text-slate-300">
              Tem certeza que deseja excluir o profissional <strong>{staffToDelete.name}</strong>? Esta ação removerá o barbeiro da lista de agendamentos e seu perfil da unidade.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-md shadow-red-500/20 transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
