import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Key, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RegisterTenantModalProps {
  onClose: () => void;
}

export const RegisterTenantModal: React.FC<RegisterTenantModalProps> = ({ onClose }) => {
  const { registerTenantWithInvite } = useAuth();

  const [invitationCode, setInvitationCode] = useState('EBD-DONO-2026');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!invitationCode.trim()) {
      setErrorMsg('A criação de novas unidades exige um código de convite válido emitido pelo Super Admin.');
      return;
    }

    try {
      registerTenantWithInvite({
        invitationCode,
        name,
        slug,
        ownerName,
        ownerEmail,
        phone,
        address,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar estabelecimento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-yellow-500 mb-1">
          <Key className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">Cadastrar Loja via Convite</h2>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          O registro de novos parceiros é controlado. Insira o token de convite fornecido pelo Super Admin.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Loja Cadastrada com Sucesso!</h3>
            <p className="text-xs text-slate-400">Sua unidade nasceu pura e pronta para configuração.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* INVITATION CODE (MANDATORY FIELD) */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-1">
              <label className="text-xs font-bold text-yellow-500 flex items-center justify-between">
                <span>Código de Convite (Obrigatório)</span>
                <span className="text-[10px] uppercase font-mono bg-yellow-500 text-black px-1.5 rounded font-extrabold">
                  Requerido
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: EBD-DONO-2026"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                className="w-full bg-[#0F1115] border border-yellow-500/40 rounded-lg px-3 py-2 text-xs text-yellow-500 font-mono focus:outline-none uppercase font-bold"
              />
              <p className="text-[10px] text-slate-400">
                O código de teste <span className="text-yellow-400 font-mono font-bold">EBD-DONO-2026</span> já está pré-preenchido.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Estabelecimento</label>
              <input
                type="text"
                required
                placeholder="Ex: BarberShop Dantas"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">URL / Slug de Acesso</label>
              <input
                type="text"
                required
                placeholder="ex: barbershop-dantas"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Proprietário</label>
                <input
                  type="text"
                  required
                  placeholder="Seu Nome"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail do Proprietário</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
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
                placeholder="Rua Exemplo, 123 - Cidade, UF"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-bold text-black shadow-md shadow-yellow-500/20"
              >
                Validar Convite & Criar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
