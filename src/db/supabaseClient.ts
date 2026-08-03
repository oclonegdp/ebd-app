import { createClient } from '@supabase/supabase-js';

// Environment variable references for Supabase connection
const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

const IS_PLACEHOLDER_URL = !SUPABASE_URL || SUPABASE_URL.includes('your-supabase-project');
const IS_PLACEHOLDER_KEY = !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('sua_chave_anon') || SUPABASE_ANON_KEY.includes('placeholder');

// Se a URL/chave não estiverem configuradas de verdade, o app segue no localStorage
export const isSupabaseConfigured = !IS_PLACEHOLDER_URL && !IS_PLACEHOLDER_KEY;

export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder'
);

// Mapeamento camelCase (app) -> snake_case (banco) por coleção
const FIELD_MAPS: Record<string, Record<string, string>> = {
  businesses: {
    id: 'id', name: 'name', category: 'category', description: 'description',
    inviteCode: 'invite_code', slug: 'slug', ownerName: 'owner_name', ownerEmail: 'owner_email',
    logoUrl: 'logo_url', coverBannerUrl: 'cover_banner_url', address: 'address', city: 'city',
    phone: 'phone', whatsapp: 'whatsapp', email: 'email', instagram: 'instagram',
    rating: 'rating', totalReviews: 'total_reviews', isOpen: 'is_open',
    workingHours: 'working_hours', slotIntervalMinutes: 'slot_interval_minutes',
    planDays: 'plan_days', planExpiresAt: 'plan_expires_at', planCreatedAt: 'plan_created_at'
  },
  services: {
    id: 'id', businessId: 'business_id', name: 'name', category: 'category',
    description: 'description', durationMinutes: 'duration_minutes', price: 'price', iconName: 'icon_name'
  },
  staff: {
    id: 'id', businessId: 'business_id', name: 'name', role: 'role', avatarUrl: 'avatar_url',
    bio: 'bio', rating: 'rating', specialties: 'specialties', availableDays: 'available_days',
    workStart: 'work_start', workEnd: 'work_end', lunchStart: 'lunch_start', lunchEnd: 'lunch_end', phone: 'phone'
  },
  appointments: {
    id: 'id', businessId: 'business_id', clientName: 'client_name', clientPhone: 'client_phone',
    clientEmail: 'client_email', serviceId: 'service_id', serviceName: 'service_name',
    servicePrice: 'service_price', durationMinutes: 'duration_minutes', staffId: 'staff_id',
    staffName: 'staff_name', staffAvatar: 'staff_avatar', date: 'date', timeSlot: 'time_slot',
    status: 'status', notes: 'notes', createdAt: 'created_at'
  },
  blockedSlots: {
    id: 'id', businessId: 'business_id', staffId: 'staff_id', staffName: 'staff_name',
    date: 'date', timeSlot: 'time_slot', reason: 'reason', createdAt: 'created_at'
  },
  userAccounts: {
    id: 'id', businessId: 'business_id', name: 'name', email: 'email',
    passwordHash: 'password_hash', role: 'role', staffId: 'staff_id',
    avatarUrl: 'avatar_url', phone: 'phone', createdAt: 'created_at'
  }
};

const TABLE_NAMES: Record<string, string> = {
  businesses: 'businesses',
  services: 'services',
  staff: 'staff_members',
  appointments: 'appointments',
  blockedSlots: 'blocked_slots',
  userAccounts: 'users'
};

const camelToSnake = (obj: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const dbKey = map[key];
    if (dbKey !== undefined) out[dbKey] = value;
  }
  return out;
};

const snakeToCamel = (row: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  const reverse: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(map)) reverse[snake] = camel;
  for (const [key, value] of Object.entries(row)) {
    const camelKey = reverse[key];
    if (camelKey !== undefined) out[camelKey] = value;
  }
  return out;
};

/**
 * Sincroniza (upsert) uma coleção inteira no Supabase. Nunca lança erro:
 * em falha (ex: RLS/anon key ausente) retorna false e o app segue no localStorage.
 */
export async function syncCollection(collection: string, rows: Record<string, unknown>[]): Promise<boolean> {
  if (!isSupabaseConfigured || !rows.length) return false;
  const map = FIELD_MAPS[collection];
  const table = TABLE_NAMES[collection];
  if (!map || !table) return false;
  try {
    const payload = rows.map(r => camelToSnake(r, map));
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase] sync ${table} falhou (fallback localStorage):`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] sync falhou (fallback localStorage):', err);
    return false;
  }
}

/**
 * Carrega todas as linhas de uma tabela mapeadas para o formato do app.
 * Retorna [] em falha (RLS/chave ausente) para que o localStorage siga valendo.
 */
export async function fetchAll(collection: string): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured) return [];
  const map = FIELD_MAPS[collection];
  const table = TABLE_NAMES[collection];
  if (!map || !table) return [];
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`[Supabase] fetch ${table} falhou (fallback localStorage):`, error.message);
      return [];
    }
    return (data || []).map(row => snakeToCamel(row, map));
  } catch (err) {
    console.warn('[Supabase] fetch falhou (fallback localStorage):', err);
    return [];
  }
}

/**
 * Helper utility to query multi-tenant records strictly filtered by businessId.
 */
export async function getTenantRecords<T>(tableName: string, businessId: string): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.warn(`[Supabase Multi-Tenant] Using local state fallback for ${tableName}:`, error.message);
      return [];
    }
    return (data as T[]) || [];
  } catch (err) {
    console.warn(`[Supabase Multi-Tenant] Error querying ${tableName}:`, err);
    return [];
  }
}
