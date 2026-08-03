/**
 * Helper utilities for parsing store slug from URL and generating unique showcase links
 */

export function getSlugFromURL(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Path check: /vitrine/:slug or /:slug
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts[0] === 'vitrine' && pathParts[1]) {
    return pathParts[1];
  }

  // 2. Hash check: #/vitrine/:slug or #vitrine/:slug or #:slug
  const hash = window.location.hash.replace(/^#\/?/, '');
  const hashParts = hash.split('/').filter(Boolean);
  if (hashParts[0] === 'vitrine' && hashParts[1]) {
    return hashParts[1];
  } else if (hashParts[0] && !['admin', 'client', 'login', 'register'].includes(hashParts[0])) {
    return hashParts[0];
  }

  // 3. Query string check: ?slug=barbearia-vintage or ?vitrine=barbearia-vintage or ?store=barbearia-vintage or ?loja=barbearia-vintage
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('slug') || params.get('vitrine') || params.get('store') || params.get('loja');
  if (querySlug) {
    return querySlug;
  }

  return null;
}

export function getStorePublicUrl(slug: string): string {
  if (typeof window === 'undefined') return `/vitrine/${slug}`;
  const origin = window.location.origin;
  return `${origin}/vitrine/${slug}`;
}

export function getWhatsAppShareUrl(storeName: string, slug: string): string {
  const url = getStorePublicUrl(slug);
  const text = `Olá! Agende seu horário na *${storeName}* de forma simples e rápida através do nosso link exclusivo:\n\n👉 ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
