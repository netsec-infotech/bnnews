const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? window.location.port === '3100'
      ? 'http://localhost:5100'
      : 'http://localhost:5000'
    : 'https://api.bnnewsgujarati.com');

/**
 * Returns a fully qualified, browser-loadable URL for any asset.
 * If the path is a relative upload (/uploads/foo.webp), it attaches the backend origin if needed.
 */
export function getMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.startsWith('/uploads/')) {
    return `${BACKEND_URL}${clean}`;
  }
  return clean;
}

export default getMediaUrl;
