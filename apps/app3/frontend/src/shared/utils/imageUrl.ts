import { API_BASE_URL } from '@/src/shared/api/client';

/**
 * Resolves an image URL or local storage path to an accessible URL.
 * Handles:
 * - Full URLs (http://, https://) -> returns as is (e.g. S3 or Unsplash)
 * - Base64 Data URLs (data:image/...) -> returns as is
 * - Relative upload paths (/uploads/...) -> prepends backend origin in local dev or keeps relative in prod
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (API_BASE_URL.startsWith('http')) {
      const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      return `${backendOrigin}${cleanPath}`;
    }
    return cleanPath;
  }

  return trimmed;
}

