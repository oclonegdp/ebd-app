import { Business, Service, StaffMember, Appointment, NotificationItem, User, BlockedSlot } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_1',
  name: 'Carlos Oliveira',
  email: 'carlos@elbravodantas.com.br',
  role: 'admin',
  businessId: 'biz_barber',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '(11) 98765-4321'
};

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz_toni',
    name: 'Toni do Corte Barbershop',
    category: 'barbearia',
    description: 'A barbearia do Toni: referência em degradê americano, corte freestyle e barboterapia clássica.',
    inviteCode: 'TONI2026',
    slug: 'toni-do-corte',
    ownerName: 'Toni Barbeiro',
    ownerEmail: 'toni@tonidocorte.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
    address: 'Rua Augusta, 1200 - Consolação',
    city: 'São Paulo, SP',
    phone: '(11) 97123-1122',
    whatsapp: '5511971231122',
    email: 'contato@tonidocorte.com.br',
    instagram: '@tonidocorte',
    rating: 4.9,
    totalReviews: 87,
    isOpen: true,
    workingHours: 'Segunda a Sábado, 09h00 às 20h00',
    slotIntervalMinutes: 30
  },
  {
    id: 'biz_corte_artes',
    name: 'Corte Artes Studio',
    category: 'barbearia',
    description: 'Ateliê de cortes artísticos, visagismo exclusivo, barboterapia relaxante e ambiente executive.',
    inviteCode: 'CORTEARTES',
    slug: 'corte-artes',
    ownerName: 'Mestre Arthur',
    ownerEmail: 'arthur@corteartes.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&auto=format&fit=crop&q=80',
    address: 'Alameda Santos, 900 - Cerqueira César',
    city: 'São Paulo, SP',
    phone: '(11) 98822-3344',
    whatsapp: '5511988223344',
    email: 'contato@corteartes.com.br',
    instagram: '@corteartes.studio',
    rating: 5.0,
    totalReviews: 142,
    isOpen: true,
    workingHours: 'Terça a Sábado, 08h30 às 19h30',
    slotIntervalMinutes: 45
  },
  {
    id: 'biz_barber',
    name: 'EBD Barber Shop - Studio Premium (ElBravoDantasOficial)',
    category: 'barbearia',
    description: 'Especialistas em cortes modernos, degradê de alta precisão, barba terapia com toalha quente e atendimento VIP com cerveja gelada.',
    inviteCode: 'BARBER_EBD',
    slug: 'ebd-barber-shop',
    ownerName: 'Carlos Oliveira',
    ownerEmail: 'carlos@elbravodantas.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
    address: 'Av. Paulista, 1500 - Bela Vista',
    city: 'São Paulo, SP',
    phone: '(11) 3289-4000',
    whatsapp: '5511988887777',
    email: 'contato@elbravodantas.com.br',
    instagram: '@elbravodantasoficial',
    rating: 4.9,
    totalReviews: 128,
    isOpen: true,
    workingHours: 'Segunda a Sábado, 08h00 às 20h00',
    slotIntervalMinutes: 30
  },
  {
    id: 'biz_gym',
    name: 'EBD Fitness & Performance Gym',
    category: 'academia',
    description: 'Centro de treinamento funcional, musculação guiada, aulas de spinning e avaliação física computadorizada com profissionais dedicados.',
    inviteCode: 'FITNESS_EBD',
    slug: 'ebd-fitness',
    ownerName: 'Juliana Costa',
    ownerEmail: 'juliana@elbravodantas.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    address: 'Rua Oscar Freire, 820 - Jardins',
    city: 'São Paulo, SP',
    phone: '(11) 3081-9000',
    whatsapp: '5511977776666',
    email: 'atendimento@elbravodantas.com.br',
    instagram: '@elbravodantasfit',
    rating: 4.8,
    totalReviews: 94,
    isOpen: true,
    workingHours: 'Segunda a Sexta, 06h00 às 22h00 | Sáb, 08h às 16h',
    slotIntervalMinutes: 60
  },
  {
    id: 'biz_beauty',
    name: 'EBD Beauty & Estética',
    category: 'beleza',
    description: 'Salão de beleza completo e spa urbano. Design de sobrancelhas, harmonização facial, tratamento capilar e manicure especializada.',
    inviteCode: 'BEAUTY_EBD',
    slug: 'ebd-beauty',
    ownerName: 'Camila Rodrigues',
    ownerEmail: 'camila@elbravodantas.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80',
    coverBannerUrl: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&auto=format&fit=crop&q=80',
    address: 'Rua Funchal, 418 - Vila Olímpia',
    city: 'São Paulo, SP',
    phone: '(11) 3845-1200',
    whatsapp: '5511966665555',
    email: 'contato@elbravodantasbeauty.com.br',
    instagram: '@elbravodantasbeauty',
    rating: 5.0,
    totalReviews: 215,
    isOpen: true,
    workingHours: 'Terça a Sábado, 09h00 às 19h00',
    slotIntervalMinutes: 45
  }
];

export const INITIAL_SERVICES: Service[] = [
  // Toni do Corte
  {
    id: 'srv_toni_1',
    businessId: 'biz_toni',
    name: 'Corte Degradê do Toni',
    category: 'Cabelo',
    description: 'Degradê na navalha com acabamento no risquinho e lavagem especial.',
    durationMinutes: 40,
    price: 55.00
  },
  {
    id: 'srv_toni_2',
    businessId: 'biz_toni',
    name: 'Barboterapia & Toalha Quente Toni',
    category: 'Barba',
    description: 'Modelagem de barba com óleo de argan, vaporização e massagem facial.',
    durationMinutes: 30,
    price: 45.00
  },
  {
    id: 'srv_toni_3',
    businessId: 'biz_toni',
    name: 'Combo Completo do Toni (Cabelo + Barba + Sobrancelha)',
    category: 'Combos',
    description: 'Serviço completo VIP do Toni com bebida cortesia.',
    durationMinutes: 70,
    price: 90.00
  },

  // Corte Artes
  {
    id: 'srv_artes_1',
    businessId: 'biz_corte_artes',
    name: 'Corte Executivo Visagista',
    category: 'Cabelo',
    description: 'Estudo visagista do formato do rosto e corte de alta precisão com tesoura importada.',
    durationMinutes: 50,
    price: 85.00
  },
  {
    id: 'srv_artes_2',
    businessId: 'biz_corte_artes',
    name: 'Ritual Barba & Spa Facial',
    category: 'Barba',
    description: 'Tratamento de barba com produtos orgânicos, hidratação profunda e drenagem facial.',
    durationMinutes: 40,
    price: 70.00
  },

  // Barbearia EBD
  {
    id: 'srv_1',
    businessId: 'biz_barber',
    name: 'Corte de Cabelo Masculino',
    category: 'Cabelo',
    description: 'Corte moderno ou clássico com tesoura e máquina, finalização com pomada e alinhamento do pezinho.',
    durationMinutes: 45,
    price: 65.00
  },
  {
    id: 'srv_2',
    businessId: 'biz_barber',
    name: 'Barba Terapia Completa',
    category: 'Barba',
    description: 'Modelagem de barba com toalha quente, óleos hidratantes, esfoliação facial e massagem pós-barba.',
    durationMinutes: 30,
    price: 50.00
  },
  {
    id: 'srv_3',
    businessId: 'biz_barber',
    name: 'Combo VIP (Cabelo + Barba)',
    category: 'Combos',
    description: 'Experiência completa de corte personalizado, barbeamento premium e uma bebida cortesia à sua escolha.',
    durationMinutes: 75,
    price: 100.00
  },
  {
    id: 'srv_4',
    businessId: 'biz_barber',
    name: 'Pigmentação de Barba ou Cabelo',
    category: 'Tratamentos',
    description: 'Disfarce de fios brancos e correção de falhas com tintura hipoalergênica de alta durabilidade.',
    durationMinutes: 30,
    price: 45.00
  },
  {
    id: 'srv_5',
    businessId: 'biz_barber',
    name: 'Sobrancelha na Navalha',
    category: 'Acabamento',
    description: 'Design e alinhamento de sobrancelha masculina mantendo aspecto natural.',
    durationMinutes: 15,
    price: 20.00
  },

  // Academia
  {
    id: 'srv_gym_1',
    businessId: 'biz_gym',
    name: 'Sessão de Personal Trainer 1:1',
    category: 'Personal',
    description: 'Acompanhamento individualizado de 1 hora com montagem e execução guiada de ficha.',
    durationMinutes: 60,
    price: 90.00
  },
  {
    id: 'srv_gym_2',
    businessId: 'biz_gym',
    name: 'Avaliação Física & Bioimpedância',
    category: 'Avaliação',
    description: 'Análise corporal detalhada de massa magra, gordura viceral e metas nutricionais.',
    durationMinutes: 45,
    price: 120.00
  },
  {
    id: 'srv_gym_3',
    businessId: 'biz_gym',
    name: 'Aula de Cross Training em Grupo',
    category: 'Aulas',
    description: 'Treino de alta intensidade focado em força, resistência e condicionamento cardio.',
    durationMinutes: 50,
    price: 40.00
  },

  // Beleza
  {
    id: 'srv_beauty_1',
    businessId: 'biz_beauty',
    name: 'Design de Sobrancelha com Henna',
    category: 'Facial',
    description: 'Mapeamento facial, remoção de fios com pinça e aplicação de henna natural.',
    durationMinutes: 45,
    price: 75.00
  },
  {
    id: 'srv_beauty_2',
    businessId: 'biz_beauty',
    name: 'Limpeza de Pele Profunda',
    category: 'Estética',
    description: 'Higienização, vapor de ozônio, extração de cravos e máscara hidratante calmante.',
    durationMinutes: 60,
    price: 150.00
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  // Toni do Corte
  {
    id: 'stf_toni_1',
    businessId: 'biz_toni',
    name: 'Toni Barbeiro (Fundador)',
    role: 'Mestre do Degradê',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Fundador do Toni do Corte, com mais de 10 anos cortando estilos urbanos e degradês de precisão.',
    rating: 4.9,
    specialties: ['Degradê Americano', 'Freestyle', 'Barboterapia'],
    availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '09:00',
    workEnd: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    phone: '(11) 97123-1122'
  },
  {
    id: 'stf_toni_2',
    businessId: 'biz_toni',
    name: 'Cleber "Navalha"',
    role: 'Barbeiro Residente',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Especialista em alinhamento de barba, corte social e sobrancelha.',
    rating: 4.8,
    specialties: ['Corte Social', 'Barba', 'Sobrancelha'],
    availableDays: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '10:00',
    workEnd: '20:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    phone: '(11) 97123-9988'
  },

  // Corte Artes
  {
    id: 'stf_artes_1',
    businessId: 'biz_corte_artes',
    name: 'Mestre Arthur',
    role: 'Diretor Visagista',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Especialista em visagismo capilar executive e cortes masculinos de alta costura.',
    rating: 5.0,
    specialties: ['Visagismo Executive', 'Tesoura de Alta Precisão', 'Tratamentos Capilares'],
    availableDays: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '08:30',
    workEnd: '18:30',
    lunchStart: '12:30',
    lunchEnd: '13:30',
    phone: '(11) 98822-3344'
  },

  // Barbearia EBD
  {
    id: 'stf_1',
    businessId: 'biz_barber',
    name: 'Matheus Santos (Mestre Barbeiro)',
    role: 'Senior Barber',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Mais de 8 anos de experiência em degradê navalhado, visagismo masculino e barboterapia clássica.',
    rating: 4.9,
    specialties: ['Degradê', 'Barba Terapia', 'Visagismo'],
    availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '09:00',
    workEnd: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    phone: '(11) 98111-2233'
  },
  {
    id: 'stf_2',
    businessId: 'biz_barber',
    name: 'Lucas "Fader" Lima',
    role: 'Especialista em Cortes Modernos',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Especialista em cortes urbanos, freestyle, riscos na sobrancelha e platinados masculinos.',
    rating: 4.8,
    specialties: ['Freestyle', 'Corte Americano', 'Pigmentação'],
    availableDays: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '10:00',
    workEnd: '20:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    phone: '(11) 98222-3344'
  },
  {
    id: 'stf_3',
    businessId: 'biz_barber',
    name: 'Rafael Mendes',
    role: 'Barbeiro & Visagista',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    bio: 'Mestre em corte social clássico, alinhamento de barba com lâmina cega e tratamento para queda.',
    rating: 5.0,
    specialties: ['Corte Clássico', 'Barba Clássica', 'Hidratação'],
    availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    workStart: '08:00',
    workEnd: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    phone: '(11) 98333-4455'
  },

  // Academia
  {
    id: 'stf_gym_1',
    businessId: 'biz_gym',
    name: 'Juliana Costa',
    role: 'Personal Trainer & Nutricionista',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    bio: 'Especialista em hipertrofia, emagrecimento funcional e reabilitação postural.',
    rating: 4.9,
    specialties: ['Hipertrofia', 'Emagrecimento', 'Bioimpedância'],
    availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    workStart: '06:00',
    workEnd: '15:00',
    lunchStart: '11:00',
    lunchEnd: '12:00',
    phone: '(11) 97111-9988'
  },

  // Beleza
  {
    id: 'stf_beauty_1',
    businessId: 'biz_beauty',
    name: 'Camila Rodrigues',
    role: 'Esteticista & Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    bio: 'Especialista em micropigmentação labial, brow lamination e cuidados faciais avançados.',
    rating: 5.0,
    specialties: ['Sobrancelhas', 'Limpeza de Pele', 'Brow Lamination'],
    availableDays: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    workStart: '09:00',
    workEnd: '18:00',
    phone: '(11) 96555-4433'
  }
];

// Helper to get ISO date string YYYY-MM-DD relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app_1',
    businessId: 'biz_barber',
    clientName: 'Fernando Alcantara',
    clientPhone: '(11) 99123-4567',
    clientEmail: 'fernando@gmail.com',
    serviceId: 'srv_3',
    serviceName: 'Combo VIP (Cabelo + Barba)',
    servicePrice: 100.00,
    durationMinutes: 75,
    staffId: 'stf_1',
    staffName: 'Matheus Santos',
    staffAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(0), // Today
    timeSlot: '09:00',
    status: 'confirmed',
    notes: 'Cliente prefere degradê meio alto no pente 1.5',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'app_2',
    businessId: 'biz_barber',
    clientName: 'Gabriel Viana',
    clientPhone: '(11) 98877-6655',
    clientEmail: 'gabriel.viana@outook.com',
    serviceId: 'srv_1',
    serviceName: 'Corte de Cabelo Masculino',
    servicePrice: 65.00,
    durationMinutes: 45,
    staffId: 'stf_2',
    staffName: 'Lucas "Fader" Lima',
    staffAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(0), // Today
    timeSlot: '10:30',
    status: 'confirmed',
    notes: 'Primeira vez no estabelecimento',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'app_3',
    businessId: 'biz_barber',
    clientName: 'Rodrigo Nogueira',
    clientPhone: '(11) 97711-2244',
    serviceId: 'srv_2',
    serviceName: 'Barba Terapia Completa',
    servicePrice: 50.00,
    durationMinutes: 30,
    staffId: 'stf_1',
    staffName: 'Matheus Santos',
    staffAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(0), // Today
    timeSlot: '14:00',
    status: 'pending',
    notes: 'Agendado pelo site da Vitrine',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'app_4',
    businessId: 'biz_barber',
    clientName: 'Marcelo Rossi',
    clientPhone: '(11) 99888-1122',
    serviceId: 'srv_1',
    serviceName: 'Corte de Cabelo Masculino',
    servicePrice: 65.00,
    durationMinutes: 45,
    staffId: 'stf_3',
    staffName: 'Rafael Mendes',
    staffAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(0), // Today
    timeSlot: '16:00',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'app_5',
    businessId: 'biz_barber',
    clientName: 'Thiago Faria',
    clientPhone: '(11) 98111-9900',
    serviceId: 'srv_3',
    serviceName: 'Combo VIP (Cabelo + Barba)',
    servicePrice: 100.00,
    durationMinutes: 75,
    staffId: 'stf_2',
    staffName: 'Lucas "Fader" Lima',
    staffAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(1), // Tomorrow
    timeSlot: '11:00',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'app_6',
    businessId: 'biz_barber',
    clientName: 'André Souza',
    clientPhone: '(11) 97654-3210',
    serviceId: 'srv_1',
    serviceName: 'Corte de Cabelo Masculino',
    servicePrice: 65.00,
    durationMinutes: 45,
    staffId: 'stf_1',
    staffName: 'Matheus Santos',
    staffAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    date: getRelativeDate(2), // Day after tomorrow
    timeSlot: '15:30',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Novo Agendamento Confirmado',
    message: 'Gabriel Viana agendou Corte de Cabelo para hoje às 10:30 com Lucas "Fader".',
    timestamp: 'Há 15 minutos',
    read: false,
    type: 'booking'
  },
  {
    id: 'notif_2',
    title: 'Solicitação Pendente na Vitrine',
    message: 'Rodrigo Nogueira solicitou Barba Terapia para hoje às 14:00 com Matheus Santos.',
    timestamp: 'Há 1 hora',
    read: false,
    type: 'reminder'
  },
  {
    id: 'notif_3',
    title: 'Lembrete do Sistema EBD',
    message: 'Seu faturamento estimado para esta semana é de R$ 1.840,00 (+18% em relação à anterior).',
    timestamp: 'Hoje, 08:00',
    read: true,
    type: 'system'
  }
];

export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'blk_1',
    businessId: 'biz_barber',
    staffId: 'stf_1',
    staffName: 'Matheus Santos (Mestre Barbeiro)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '15:00',
    reason: 'Compromisso Médico Pessoal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'blk_2',
    businessId: 'biz_barber',
    staffId: 'all',
    staffName: 'Toda a Equipe',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '18:00',
    reason: 'Treinamento de Visagismo da Equipe',
    createdAt: new Date().toISOString()
  }
];
