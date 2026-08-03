export type UserRole = 'superadmin' | 'admin' | 'staff' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string; // Bound business for admin/owner or staff
  staffId?: string; // Bound staff member when role is staff
  avatarUrl?: string;
  phone?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  businessId?: string;
  staffId?: string;
  createdAt: string;
}

export type BusinessCategory = 'barbearia' | 'academia' | 'beleza' | 'saude' | 'outros';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  inviteCode: string; // Ex: TONI2026, CORTEARTES
  slug: string; // Ex: toni-do-corte, corte-artes
  ownerName?: string;
  ownerEmail?: string;
  ownerPassword?: string;
  planExpiresAt?: string; // e.g. YYYY-MM-DD
  logoUrl: string;
  coverBannerUrl: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  workingHours: string;
  slotIntervalMinutes: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  price: number; // In BRL (R$)
  iconName?: string;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  role: string;
  email?: string;
  password?: string;
  avatarUrl: string;
  bio: string;
  rating: number;
  specialties: string[];
  availableDays: string[]; // e.g. ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  workStart: string; // "08:00"
  workEnd: string; // "19:00"
  lunchStart?: string; // "12:00"
  lunchEnd?: string; // "13:00"
  phone: string;
}

export interface BlockedSlot {
  id: string;
  businessId: string;
  staffId: string; // 'all' or specific staff ID
  staffName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm e.g. "14:00"
  reason: string; // "Intervalo", "Compromisso pessoal", "Bloqueio de Agenda", etc.
  createdAt: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  businessId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  durationMinutes: number;
  staffId: string;
  staffName: string;
  staffAvatar: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm (e.g. "10:00")
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'cancellation' | 'reminder' | 'system';
}

export type ActiveTab = 
  | 'dashboard' 
  | 'schedule' 
  | 'expediente'
  | 'minha-agenda'
  | 'storefront' 
  | 'services' 
  | 'staff' 
  | 'notifications' 
  | 'settings';
