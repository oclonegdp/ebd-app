/**
 * Helper utilities for parsing store slug from URL and generating unique showcase links
 */

export function getSlugFromURL(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Query string check: ?loja=slug or ?token=slug or ?slug=slug or ?vitrine=slug or ?store=slug
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('loja') || params.get('token') || params.get('slug') || params.get('vitrine') || params.get('store');
  if (querySlug) {
    return querySlug;
  }

  // 2. Hash check fallback: #/vitrine/:slug or #vitrine/:slug or #:slug
  const hash = window.location.hash.replace(/^#\/?/, '');
  const hashParts = hash.split('/').filter(Boolean);
  if (hashParts[0] === 'vitrine' && hashParts[1]) {
    return hashParts[1];
  } else if (hashParts[0] && !['admin', 'client', 'login', 'register'].includes(hashParts[0])) {
    return hashParts[0];
  }

  // 3. Path check fallback: /vitrine/:slug
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts[0] === 'vitrine' && pathParts[1]) {
    return pathParts[1];
  }

  return null;
}

export function getStorePublicUrl(slug: string): string {
  if (typeof window === 'undefined') return `/?loja=${slug}`;
  const origin = window.location.origin;
  return `${origin}/?loja=${slug}`;
}

export function getWhatsAppShareUrl(storeName: string, slug: string): string {
  const url = getStorePublicUrl(slug);
  const text = `Olá! Agende seu horário na *${storeName}* de forma simples e rápida através do nosso link exclusivo:\n\n👉 ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
