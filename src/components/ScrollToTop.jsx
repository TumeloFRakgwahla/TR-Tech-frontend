import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { disableNativeScrollRestoration, clearScrollPosition } from '../lib/scrollRestoration';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    disableNativeScrollRestoration();
    clearScrollPosition(pathname);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
