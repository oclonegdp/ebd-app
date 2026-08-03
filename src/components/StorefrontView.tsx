import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Instagram, 
  Clock, 
  Star, 
  Scissors, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Globe, 
  ChevronRight,
  Info,
  Sparkles,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FloatingChat } from './FloatingChat';

export const StorefrontView: React.FC = () => {
  const { selectedBusiness, services, staff, openBookingModal, showToast } = useApp();
  
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentServices = services.filter(s => s.businessId === selectedBusiness.id);
  const currentStaff = staff.filter(s => s.businessId === selectedBusiness.id);

  // Extract unique categories
  const categories = ['Todos', ...Array.from(new Set(currentServices.map(s => s.category)))];

  // Filter services by category and search term
  const filteredServices = currentServices.filter(srv => {
    const matchesCat = activeCategory === 'Todos' || srv.category === activeCategory;
    const matchesQuery = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link da vitrine copiado para a área de transferência!');
    } else {
      showToast('Link pronto para compartilhamento!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Cover Banner & Business Header */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
        {/* Banner Image */}
        <div className="h-64 sm:h-80 w-full relative">
          <img 
            src={selectedBusiness.coverBannerUrl} 
            alt={selectedBusiness.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
          
          {/* Top Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 py-2 px-3.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Vitrine</span>
          </button>
        </div>

        {/* Business Main Details Info Block */}
        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo Avatar */}
            <div className="relative">
              <img 
                src={selectedBusiness.logoUrl} 
                alt={selectedBusiness.name} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-zinc-950 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-white" title="Aberto">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Name, Category & Rating */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider">
                  {selectedBusiness.category}
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedBusiness.rating}</span>
                  <span className="text-zinc-400 font-normal">({selectedBusiness.totalReviews} avaliações)</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedBusiness.name}
              </h1>
              <p className="text-xs text-zinc-300 max-w-xl line-clamp-2">
                {selectedBusiness.description}
              </p>
            </div>
          </div>

          {/* Primary Call to Action Button */}
          <button
            onClick={() => openBookingModal()}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Horário Agora</span>
          </button>
        </div>

        {/* Info Contact Bar */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{selectedBusiness.address}, {selectedBusiness.city}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{selectedBusiness.workingHours}</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={`https://wa.me/${selectedBusiness.whatsapp}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>{selectedBusiness.phone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Services Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Scissors className="w-5 h-5 text-blue-400" />
              <span>Serviços Disponíveis</span>
            </h2>
            <p className="text-xs text-zinc-400">Escolha o serviço desejado e agende online em segundos</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition
                ${activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((srv) => (
            <div 
              key={srv.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/90 hover:border-blue-500/50 transition flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    {srv.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-sm whitespace-nowrap">
                    {formatBRL(srv.price)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Duração: {srv.durationMinutes} minutos</span>
                </span>

                <button
                  onClick={() => openBookingModal({ serviceId: srv.id })}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-blue-600/20"
                >
                  <span>Agendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Team / Professionals Preview */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Nossa Equipe de Profissionais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentStaff.map((member) => (
            <div 
              key={member.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3 hover:border-zinc-700 transition"
            >
              <img 
                src={member.avatarUrl} 
                alt={member.name}
                className="w-20 h-20 mx-auto rounded-full object-cover ring-4 ring-blue-500/20"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                <p className="text-xs text-blue-400 font-medium">{member.role}</p>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2">
                {member.bio}
              </p>
              <button
                onClick={() => openBookingModal({ staffId: member.id })}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
              >
                Agendar com {member.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat Component */}
      <FloatingChat />
    </div>
  );
};
