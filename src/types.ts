export type UserRole = 'super_admin' | 'owner' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  tenant_id?: string;
  avatar_url?: string;
  phone?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  address?: string;
  phone?: string;
  created_at: string;
  active: boolean;
  plan?: 'trial' | 'pro' | 'enterprise';
  license_expires_at?: string;
  max_staff?: number;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
  category?: string;
}

export interface StaffMember {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  specialties: string[];
  commission_rate?: number;
  service_ids?: string[];
  working_hours?: BusinessHours[];
}

export interface Appointment {
  id: string;
  tenant_id: string;
  service_id: string;
  staff_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  payment_method?: 'local' | 'online_simulated';
  created_at: string;
}

export interface BusinessHours {
  dayNum: number;
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  role: 'owner' | 'staff';
  tenant_id?: string;
  max_uses: number;
  uses_count: number;
  created_at: string;
  active: boolean;
}
