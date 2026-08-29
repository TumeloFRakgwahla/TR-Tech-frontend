/**
 * TR-Tech Frontend — Image URL Normalization
 *
 * Product images may arrive from the backend in several formats:
 * absolute URLs, relative /uploads/... paths, or plain filenames.
 * This module normalizes them into a single consistent format so the
 * <img src="..."> renderer never breaks.
 *
 * Normalization rules:
 * 1. Absolute URLs (http/https) pass through except in dev mode where
 *    /uploads/ paths are rewritten to relative paths.
 * 2. /uploads/ relative URLs are stripped to their filename to avoid
 *    double-prefixing when the app is served from a subdirectory.
 * 3. Plain filenames or other relative paths are prefixed with /uploads/.
 */

export function getProductImageUrl(url) {
  if (!url) return '';

  // Case 1: backend returned a relative /uploads/... path
  if (url.startsWith('/uploads/')) {
    // Extract just the filename (and optional extension) to avoid nested folders
    const match = url.match(/^\/uploads\/([^/]+(?:\.\w+)?)/);
    if (match) return `/uploads/${match[1]}`;
    return url;
  }

  // Case 2: backend returned a full absolute URL
  if (/^https?:\/\//i.test(url)) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      // If the URL is malformed, return it as-is and let the browser handle the error
      return url;
    }

    // In dev mode, rewrite absolute upload URLs to relative paths
    // so the Vite dev server proxies them correctly
    if (import.meta.env.DEV && parsed.pathname.startsWith('/uploads/')) {
      const match = parsed.pathname.match(/^\/uploads\/([^/]+(?:\.\w+)?)/);
      const filename = match ? match[1] : parsed.pathname.replace(/^\/uploads\//, '');
      return `/uploads/${filename}`;
    }

    return url;
  }

  // Case 3: backend returned a plain relative path or filename
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return normalized.startsWith('/uploads/')
    ? normalized
    : `/uploads${normalized}`;
}
