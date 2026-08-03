import React, { useState, useEffect } from 'react';
import { X, Building2, Store, Phone, MapPin, FileText, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ImageUploader } from '../UI/ImageUploader';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant, updateCurrentTenant } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      setName(currentTenant.name || '');
      setSlug(currentTenant.slug || '');
      setDescription(currentTenant.description || '');
      setAddress(currentTenant.address || '');
      setPhone(currentTenant.phone || '');
      setLogoUrl(currentTenant.logo_url || '');
    }
  }, [currentTenant, isOpen]);

  if (!isOpen || !currentTenant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome da loja é obrigatório.');
      return;
    }

    try {
      setErrorMsg(null);
      updateCurrentTenant({
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        logo_url: logoUrl.trim(),
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar dados da loja.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#16191F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações da Loja / Unidade</h2>
              <p className="text-xs text-slate-400">Edite a marca, logo e informações da vitrine pública</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Uploader */}
          <ImageUploader
            currentImageUrl={logoUrl}
            onImageUploaded={(url) => setLogoUrl(url)}
            label="Logo Oficial da Barba / Loja (Tenant Logo)"
            folder={`tenants/${currentTenant.id}`}
            aspectRatio="square"
            placeholderText="Envie a logomarca oficial da loja (PC/celular) ou cole um link externo."
          />

          {/* Store Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-yellow-500" />
              <span>Nome da Loja</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="Ex: EBD BarberShop Central"
            />
          </div>

          {/* Slug URL Identifier */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Slug para URL da Vitrine</span>
              <span className="text-[10px] text-yellow-500 font-mono">/loja/{slug || 'meu-slug'}</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 font-mono"
              placeholder="ebd-barbershop"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-yellow-500" />
              <span>Telefone de Contato / WhatsApp</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="(11) 98765-4321"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-yellow-500" />
              <span>Endereço Comercial</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
              placeholder="Avenida Sapopemba, 1020 - São Paulo, SP"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-yellow-500" />
              <span>Descrição da Unidade / Apresentação</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0F1115] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 resize-none"
              placeholder="Descreva o conceito da sua loja para ser exibido na página pública para os clientes."
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/30 p-2.5 rounded-lg">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Informações da loja salvas com sucesso!</span>
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
              Salvar Dados da Loja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
