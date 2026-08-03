import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Check, Phone, FileText, Building, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageEngine } from '../../lib/storageEngine';
import { ImageUploader } from '../UI/ImageUploader';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentTenant, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setPhone(currentUser.phone || '');
      setPassword(currentUser.password || '');
      setAvatarUrl(currentUser.avatar_url || '');

      // Load staff bio if user is staff or owner
      if (currentUser.role === 'staff' || currentUser.role === 'owner') {
        const staffList = storageEngine.getStaff(currentUser.tenant_id);
        const found = staffList.find(
          (s) => s.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (found?.bio) {
          setBio(found.bio);
        }
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('O nome completo é obrigatório.');
      return;
    }

    try {
      setErrorMsg(null);
      updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        password: password.trim() || undefined,
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar o perfil.');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin Mestre (SaaS)';
      case 'owner':
        return 'Dono de Loja / Administrador';
      case 'staff':
        return 'Profissional da Equipe';
      default:
        return 'Cliente';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#16191F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Editar Meu Perfil</h2>
              <p className="text-xs text-slate-400">Atualize sua foto, nome e dados pessoais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role & Store Tag */}
        <div className="p-3 rounded-xl bg-[#0F1115] border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="font-bold text-yellow-500">{getRoleLabel(currentUser.role)}</span>
          </div>
          {currentTenant && currentUser.role !== 'super_admin' && (
            <div className="flex items-center space-x-1.5 text-slate-400 truncate max-w-[180px]">
              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Universal Image Uploader for Avatar */}
          <ImageUploader
            currentImageUrl={avatarUrl}
            onImageUploaded={(url) => setAvatarUrl(url)}
            label="Foto de Perfil Oficial"
            folder={`avatars/${currentUser.id}`}
            aspectRatio="avatar"
            placeholderText="Selecione do PC, tire uma foto pela câmera do celular ou cole um link."
          />

          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-yellow-500" />
              <span>Nome Completo</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="Seu nome oficial"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-yellow-500" />
              <span>Telefone / WhatsApp</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="(11) 99999-8888"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-yellow-500" />
              <span>Sua Senha de Acesso Secreta</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-yellow-400 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="Digite sua nova senha de acesso privada"
            />
            <p className="text-[10px] text-slate-500">Altere para a sua senha pessoal e secreta de preferência.</p>
          </div>

          {/* Bio Input (For staff/owners) */}
          {(currentUser.role === 'staff' || currentUser.role === 'owner') && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-yellow-500" />
                <span>Biografia / Apresentação Profissional</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 resize-none"
                placeholder="Conte brevemente sobre sua experiência, estilos que domina e especialidades para os clientes verem na vitrine."
              />
            </div>
          )}

          {/* Readonly Email */}
          <div className="p-3 bg-[#0F1115] border border-slate-800 rounded-lg text-xs space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">E-mail Cadastrado:</span>
            <p className="font-mono text-slate-200">{currentUser.email}</p>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/30 p-2.5 rounded-lg">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Perfil salvo com sucesso!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
