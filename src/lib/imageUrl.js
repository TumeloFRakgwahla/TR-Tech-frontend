import { API_BASE_URL } from '../constants';

export function getProductImageUrl(url) {
  if (!url) return '';

  if (url.startsWith('/uploads/')) return url;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    if (url.startsWith(baseUrl + '/uploads/')) {
      return url.replace(baseUrl, '');
    }
    return url;
  }

  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

  if (url.startsWith('/')) return `${baseUrl}${url}`;

  return `${baseUrl}/${url}`;
}
