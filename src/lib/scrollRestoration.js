const STORAGE_PREFIX = 'trtech:scroll:';

export function getScrollKey(pathname) {
  return `${STORAGE_PREFIX}${pathname}`;
}

export function clearScrollPosition(pathname) {
  if (typeof window === 'undefined') return;
  try {
    const key = getScrollKey(pathname);
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function disableNativeScrollRestoration() {
  if (typeof window !== 'undefined' && 'scrollRestoration' in window) {
    window.history.scrollRestoration = 'manual';
  }
}
