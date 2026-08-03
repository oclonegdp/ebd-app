import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Link as LinkIcon,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { uploadImageFile } from '../../lib/supabase';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
  folder?: string;
  aspectRatio?: 'square' | 'banner' | 'avatar';
  placeholderText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl = '',
  onImageUploaded,
  label = 'Foto / Imagem de Perfil',
  folder = 'profiles',
  aspectRatio = 'square',
  placeholderText = 'Selecione uma imagem ou cole a URL',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      setUploadSuccess(false);

      const uploadedUrl = await uploadImageFile(file, folder);
      setUrlInput(uploadedUrl);
      onImageUploaded(uploadedUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro no upload de imagem:', err);
      setErrorMsg(err.message || 'Falha ao processar o upload da foto.');
    } finally {
      setIsUploading(false);
      // Reset input value so re-selecting same file works
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMsg('Informe uma URL de imagem válida.');
      return;
    }
    setErrorMsg(null);
    onImageUploaded(urlInput.trim());
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleClearImage = () => {
    setUrlInput('');
    onImageUploaded('');
    setErrorMsg(null);
  };

  // Preview styling based on aspect ratio
  const previewClass =
    aspectRatio === 'avatar'
      ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-yellow-500/50 shadow-md'
      : aspectRatio === 'banner'
      ? 'w-full h-28 sm:h-36 rounded-xl object-cover border border-slate-700 shadow-md'
      : 'w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-700 shadow-md';

  return (
    <div className="space-y-3 bg-[#0F1115] border border-slate-800 rounded-xl p-3.5 sm:p-4">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            Cloud Storage / Local
          </span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-[#16191F] rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-yellow-500 text-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Enviar Foto / Câmera</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'url'
              ? 'bg-yellow-500 text-black shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Colar Link de Foto</span>
        </button>
      </div>

      {/* Main Preview and Control Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* Preview Thumbnail */}
        <div className="relative group shrink-0">
          {urlInput ? (
            <img
              src={urlInput}
              alt="Pré-visualização"
              className={previewClass}
              onError={() => setErrorMsg('Não foi possível carregar a imagem da URL fornecida.')}
            />
          ) : (
            <div
              className={`${previewClass} bg-[#16191F] flex flex-col items-center justify-center text-slate-500 p-2 text-center border-dashed`}
            >
              <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
              <span className="text-[9px] font-mono leading-tight">Sem Foto</span>
            </div>
          )}

          {urlInput && (
            <button
              type="button"
              onClick={handleClearImage}
              title="Remover foto"
              className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg transition cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab 1: Upload from Device / Camera */}
        {activeTab === 'upload' && (
          <div className="flex-1 w-full space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#16191F] hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-yellow-500 shrink-0" />
                )}
                <span>{isUploading ? 'Enviando...' : 'Galeria / Dispositivo'}</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#16191F] hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tirar Foto</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Aceita JPG, PNG ou WEBP. A foto é otimizada e armazenada no Supabase Storage.
            </p>
          </div>
        )}

        {/* Tab 2: External URL Input */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyUrl} className="flex-1 w-full space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full bg-[#16191F] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="py-1.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-lg active:scale-95 transition cursor-pointer shrink-0"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{placeholderText}</p>
          </form>
        )}
      </div>

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>Foto atualizada com sucesso!</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <p className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
