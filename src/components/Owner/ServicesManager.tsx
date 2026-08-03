import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Scissors, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { storageEngine } from '../../lib/storageEngine';
import { Service } from '../../types';
import { ImageUploader } from '../UI/ImageUploader';

export const ServicesManager: React.FC = () => {
  const { currentTenant } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(50);
  const [imageUrl, setImageUrl] = useState('');

  const loadServices = () => {
    if (currentTenant) {
      setServices(storageEngine.getServices(currentTenant.id));
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentTenant]);

  const handleOpenModal = (srv?: Service) => {
    if (srv) {
      setEditingService(srv);
      setName(srv.name);
      setDescription(srv.description);
      setDuration(srv.duration_minutes);
      setPrice(srv.price);
      setImageUrl(srv.image_url || '');
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setDuration(30);
      setPrice(50);
      setImageUrl('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    storageEngine.saveService({
      id: editingService?.id,
      tenant_id: currentTenant.id,
      name,
      description,
      duration_minutes: duration,
      price,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
    });

    loadServices();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      storageEngine.deleteService(id);
      loadServices();
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-[#16191F] border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-yellow-500" />
            Catálogo & Tabela de Preços de Serviços
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre os procedimentos oferecidos na sua unidade e sincronize com a Vitrine Pública.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md shadow-yellow-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#16191F] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <img
                src={srv.image_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80'}
                alt={srv.name}
                className="w-full h-36 rounded-lg object-cover border border-slate-800"
              />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{srv.name}</h3>
                <span className="text-sm font-bold text-yellow-500 font-mono">R$ {srv.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
              <p className="text-[10px] text-slate-500 font-mono">Duração: {srv.duration_minutes} minutos</p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => handleOpenModal(srv)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(srv.id)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16191F] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white">
              {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Degradê Navalhado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhamento do procedimento"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>

              <ImageUploader
                currentImageUrl={imageUrl}
                onImageUploaded={(url) => setImageUrl(url)}
                label="Imagem Ilustrativa do Serviço"
                folder="services"
                aspectRatio="banner"
                placeholderText="Envie a foto do serviço do dispositivo/câmera ou cole um link."
              />

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-bold text-black shadow-md shadow-yellow-500/20"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
