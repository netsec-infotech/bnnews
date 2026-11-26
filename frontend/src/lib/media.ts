export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return port === '3100' ? 'http://localhost:5100' : 'http://localhost:5000';
    }
    // When on bnnewsgujarati.com or any of its subdomains
    if (hostname.includes('bnnewsgujarati.com')) {
      return 'https://api.bnnewsgujarati.com';
    }
    // For IP or other domain
    return `${protocol}//api.${hostname.replace(/^www\./, '')}`;
  }

  // SSR environment
  if (process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_BACKEND_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  return 'https://api.bnnewsgujarati.com';
}

/**
 * Returns a fully qualified, browser-loadable URL for any asset.
 * If the path is a relative upload (/uploads/foo.webp), it attaches the backend origin if needed.
 */
export function getMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const backendBase = getBackendBaseUrl();

  // If previous saved content has hardcoded localhost:5000 in a live environment, rewrite it to backendBase
  if (url.includes('localhost:5000/uploads/') || url.includes('localhost:5100/uploads/')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return url.replace(/http:\/\/localhost:(5000|5100)\/uploads\//, `${backendBase}/uploads/`);
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.startsWith('/uploads/')) {
    return `${backendBase}${clean}`;
  }
  return clean;
}

/**
 * Normalizes all <img> and <video> src attributes inside HTML content so that
 * relative /uploads/... or stale localhost /uploads/ URLs are rewritten to the live backend URL.
 */
export function normalizeArticleHtml(html?: string | null): string {
  if (!html || typeof html !== 'string') return '';
  const backendBase = getBackendBaseUrl();

  // 1. Replace relative /uploads/
  let normalized = html.replace(/(src=["'])\/uploads\//gi, `$1${backendBase}/uploads/`);

  // 2. Replace localhost in live production browser
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    normalized = normalized.replace(/http:\/\/localhost:(5000|5100)\/uploads\//gi, `${backendBase}/uploads/`);
  }

  return normalized;
}

export default getMediaUrl;
