export function getProductImageUrl(url) {
  if (!url) return '';

  if (url.startsWith('/uploads/')) {
    const match = url.match(/^\/uploads\/([^/]+(?:\.\w+)?)/);
    if (match) return `/uploads/${match[1]}`;
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return url;
    }

    if (import.meta.env.DEV && parsed.pathname.startsWith('/uploads/')) {
      const match = parsed.pathname.match(/^\/uploads\/([^/]+(?:\.\w+)?)/);
      const filename = match ? match[1] : parsed.pathname.replace(/^\/uploads\//, '');
      return `/uploads/${filename}`;
    }

    return url;
  }

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return normalized.startsWith('/uploads/')
    ? normalized
    : `/uploads${normalized}`;
}
